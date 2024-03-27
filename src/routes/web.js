import express from "express";
import HomeController from "../controller/homeController";
import apiController from "../controller/apiController";
import loginController from "../controller/loginController";
import passport from "passport";
import checkUser from "../middleware/checkUser";
import passController from "../controller/passportController";

const router = express.Router();

const initWebRouters = (app) => {
  router.get("/", checkUser.isLogin, HomeController.handleHome);
  router.get("/user", HomeController.handleUserPage);
  router.post("/users/create-user", HomeController.handleCreateNewUser);
  router.post("/delete-user/:id", HomeController.handleDeleteUser);
  router.get("/update-user/:id", HomeController.getUpdateUserPage);
  router.post("/users/update-user", HomeController.handleUpdateUser);

  router.get("/api/test-api", apiController.testApi);

  router.get("/login", checkUser.isLogin, loginController.getLoginPage);
  // router.post(
  //   "/login",
  //   passport.authenticate("local", {
  //     successRedirect: "/",
  //     failureRedirect: "/login",
  //   })
  // );
  router.post("/login", function (req, res, next) {
    passport.authenticate("local", function (error, user, info) {
      if (error) {
        return res.status(500).json(error);
      }
      if (!user) {
        return res.status(401).json(info.message);
      }
      req.login(user, function (err) {
        if (err) return next(err);
        return res
          .status(200)
          .json({ ...user, redirectURL: req.body.serviceURL });
      });
    })(req, res, next);
  });
  router.post("/logout", passController.handleLogout);
  router.post("/verify-token", loginController.verifySSOToken);

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/redirect",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      return res.render("social.ejs", { ssoToken: req.user.code });
    }
  );

  // router.get("/auth/facebook", passport.authenticate("facebook"));
  router.get(
    "/auth/facebook",
    passport.authorize("facebook", { scope: ["email"] })
  );

  router.get(
    "/facebook/redirect",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      return res.render("social.ejs", { ssoToken: req.user.code });
    }
  );
  return app.use("/", router);
};

export default initWebRouters;
