import loginRegisterService from "../service/loginRegisterService";
import { createJWT } from "../middleware/JWTActions";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
const getLoginPage = (req, res) => {
  const serviceURL = req.query.serviceURL;
  // console.log(serviceURL);
  return res.render("login.ejs", { redirectURL: serviceURL });
};

const verifySSOToken = async (req, res) => {
  try {
    const ssoToken = req.body.ssoToken;

    console.log(req.user);
    if (req.user && req.user.code && req.user.code === ssoToken) {
      // const ssoToken = req.body.ssoToken;
      const refreshToken = uuidv4();
      await loginRegisterService.updateUserRefreshToken(
        req.user.email,
        refreshToken
      );

      let payload = {
        email: req.user.email,
        groupWithRoles: req.user.groupWithRoles,
        username: req.user.username,
      };
      let token = createJWT(payload);

      res.cookie("access_token", token, {
        // maxAge: +process.env.MAX_AGE_ACCESS_TOKEN,
        maxAge: 900 * 1000,
        httpOnly: true,
      });
      res.cookie("refresh_token", refreshToken, {
        // maxAge: +process.env.MAX_AGE_REFRESH_TOKEN,
        maxAge: 3600 * 1000,
        httpOnly: true,
      });
      const resData = {
        access_token: token,
        refresh_token: refreshToken,
        email: req.user.email,
        groupWithRoles: req.user.groupWithRoles,
        username: req.user.username,
      };

      //destroy session
      req.session.destroy(function (err) {
        req.logout();
      });
      // const refreshToken = uuidv4();
      return res.status(200).json({
        EM: "OK",
        EC: 0,
        DT: resData,
      });
    } else {
      return res.status(401).json({
        EM: "Not match ssoToken",
        EC: 1,
        DT: "",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Something wrong in the server....",
      EC: -1,
      DT: "",
    });
  }
};
module.exports = {
  getLoginPage,
  verifySSOToken,
};
