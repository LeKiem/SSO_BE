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
  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  );
  router.post("/logout", passController.handleLogout);
  return app.use("/", router);
};

export default initWebRouters;
