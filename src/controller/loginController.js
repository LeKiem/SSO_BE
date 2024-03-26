import loginRegisterService from "../service/loginRegisterService";
import { createJWT } from "../middleware/JWTActions";
import { v4 as uuidv4 } from "uuid";
const getLoginPage = (req, res) => {
  const serviceURL = req.query.serviceURL;
  console.log(serviceURL);
  return res.render("login.ejs", { redirectURL: serviceURL });
};

const verifySSOToken = async (req, res) => {
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
    return res.status(200).json({
      EM: "OK",
      EC: 0,
      DT: "Not match",
    });
  }
};
module.exports = {
  getLoginPage,
  verifySSOToken,
};
