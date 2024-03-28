require("dotenv").config();
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import loginRegisterService from "../service/loginRegisterService";
const nonSecurePaths = [
  "/logout",
  "/register",
  "/login",
  "/verify-services-jwt",
];

const createJWT = (payload) => {
  //   let payload = { mame: "bar", address: "HN" };
  let key = process.env.JWT_SERCRET;
  let token = null;
  try {
    token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPINES_IN });
    // console.log(token);
  } catch (error) {
    console.log(error);
  }
  //   console.log(token);
  return token;
};
const verifyToken = (token) => {
  let key = process.env.JWT_SERCRET;
  let decode = null;

  try {
    decode = jwt.verify(token, key);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return "TokenExpiredError";
      // console.log("avc");
    }
    console.log(err);
  }
  return decode;
};
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const checkUserJWT = async (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();

  let cookies = req.cookies;
  const tokenFromHeader = extractToken(req);
  if ((cookies && cookies.access_token) || tokenFromHeader) {
    let access_token =
      cookies && cookies.access_token ? cookies.access_token : tokenFromHeader;
    let decode = verifyToken(access_token);
    if (decode && decode !== "TokenExpiredError") {
      decode.access_token = access_token;
      decode.refresh_token = cookies.refresh_token;
      req.user = decode;
      // req.access_token = access_token;
      next();
    } else if (decode && decode === "TokenExpiredError") {
      if (cookies && cookies.refresh_token) {
        let data = await handleRefreshToken(cookies.refresh_token);
        let newAccessToken = data.newAccessToken;
        let newRefreshToken = data.newRefreshToken;

        if (newAccessToken && newAccessToken) {
          res.cookie("access_token", newAccessToken, {
            // maxAge: +process.env.MAX_AGE_ACCESS_TOKEN,
            maxAge: 900 * 1000,
            httpOnly: true,
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
          });
          res.cookie("refresh_token", newRefreshToken, {
            // maxAge: +process.env.MAX_AGE_REFRESH_TOKEN,
            maxAge: 3600 * 1000,
            httpOnly: true,
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
          });
        }

        return res.status(405).json({
          EC: -1,
          DT: "",
          EM: "Need to retry with new token",
        });
      } else {
        return res.status(401).json({
          EC: -1,
          DT: "",
          EM: "Not authenticaed the user",
        });
      }
    } else {
      return res.status(401).json({
        EC: -1,
        DT: "",
        EM: "Not authenticaed the user",
      });
    }

    // console.log("jwt:", cookies.jwt);
  } else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticaed the user",
    });
  }
};
const handleRefreshToken = async (refreshToken) => {
  // const refreshToken = uuidv4();
  let newAccessToken = "",
    newRefreshToken = "";
  let user = await loginRegisterService.getUserByRefreshToken(refreshToken);

  if (user) {
    let payloadAccessToken = {
      email: user.email,
      groupWithRoles: user.groupWithRoles,
      username: user.username,
    };
    newAccessToken = createJWT(payloadAccessToken);
    newRefreshToken = uuidv4();
    await loginRegisterService.updateUserRefreshToken(
      user.email,
      newRefreshToken
    );
    //update user with new refreshToken
  }
  return {
    newAccessToken,
    newRefreshToken,
  };
};
const checkuserpermission = (req, res, next) => {
  if (nonSecurePaths.includes(req.path) || req.path === "/account")
    return next();

  if (req.user) {
    let email = req.user.email;
    let roles = req.user.groupWithRoles.Roles;
    let currentUrl = req.path;
    if (!roles || roles.lenght === 0) {
      return res.status(403).json({
        EC: -1,
        DT: "",
        EM: `You don't permission to access this resource...`,
      });
    }
    let canAccess = roles.some(
      (item) => item.url === currentUrl || currentUrl.includes(item.url)
    );
    if (canAccess == true) {
      next();
    } else {
      return res.status(403).json({
        EC: -1,
        DT: "",
        EM: `You don't permission to access this resource...`,
      });
    }
  } else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticaed the user",
    });
  }
};

const checkServiceJWT = (req, res, next) => {
  let tokenFromHeader = extractToken(req);
  // console.log(">>>> check token", tokenFromHeader);
  if (tokenFromHeader) {
    let access_token = tokenFromHeader;
    // axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    // let resAPI = await axios.post(process.env.API_SSO_VERIFY_ACCESS_TOKEN);
    let decode = verifyToken(access_token);
    if (decode) {
      res.status(200).json({
        EC: 0,
        DT: "",
        EM: "Verify the user",
      });
    } else
      res.status(401).json({
        EC: -1,
        DT: "",
        EM: "Not authenticated the user",
      });
  } else {
    return res.status(400).json({
      EC: -1,
      DT: "",
      EM: "Not authenticated the use",
    });
  }
};
module.exports = {
  createJWT,
  verifyToken,
  checkUserJWT,
  checkuserpermission,
  checkServiceJWT,
  handleRefreshToken,
};
