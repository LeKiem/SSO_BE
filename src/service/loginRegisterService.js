require("dotenv").config();
import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { getGroupWithRole } from "./JWTService";
import { createJWT } from "../middleware/JWTActions";
import { v4 as uuidv4 } from "uuid";

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};
const checkEmailExits = async (userEmail) => {
  let user = await db.User.findOne({
    where: { email: userEmail },
  });

  if (user) {
    return true;
  }
  return false;
};
const checkPhoneExits = async (userPhone) => {
  let user = await db.User.findOne({
    where: { phone: userPhone },
  });

  if (user) {
    return true;
  }
  return false;
};
const registerNewUser = async (rawUserData) => {
  try {
    // check email/ phoneNumber are exist
    let isEmailExist = await checkEmailExits(rawUserData.email);
    if (isEmailExist === true) {
      return {
        EM: "The email is already exist!",
        EC: 1,
      };
    }
    let isPhoneExist = await checkPhoneExits(rawUserData.phone);
    if (isPhoneExist === true) {
      return {
        EM: "The phone is already exist!",
        EC: 1,
      };
    }
    // hash user password
    let hashPassword = hashUserPassword(rawUserData.password);

    // create new user
    await db.User.create({
      email: rawUserData.email,
      username: rawUserData.username,
      password: hashPassword,
      phone: rawUserData.phone,
      groupId: 4,
    });
    return {
      EM: "A user is created successfully",
      EC: 0,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Something wrongs in service...",
      EC: -2,
    };
  }
};
const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword); // true
};

const handleUserLogin = async (rawData) => {
  try {
    let user = await db.User.findOne({
      where: {
        [Op.or]: [{ email: rawData.valueLogin }, { phone: rawData.valueLogin }],
      },
    });

    if (user) {
      // console.log("Found user with email/phone");
      let isCorrectPassword = checkPassword(rawData.password, user.password);
      if (isCorrectPassword === true) {
        const code = uuidv4();
        let groupWithRoles = await getGroupWithRole(user);
        // let payload = {
        //   email: user.email,
        //   groupWithRoles,
        //   username: user.username,
        // };

        // let token = createJWT(payload);
        return {
          EM: "OK",
          EC: 0,
          DT: {
            code: code,
            email: user.email,
            groupWithRoles,
            username: user.username,
            // access_token: token,
            // groupWithRoles,
            // email: user.email,
            // username: user.username,
          },
        };
      }
      //  else {
      //   return {
      //     EM: "Your  password is incorrect!",
      //     EC: 1,
      //     DT: "",
      //   };
      // }
    }

    // console.log(
    //   "Not found user with email/phone: ",
    //   rawData.valueLogin,
    //   "Password",
    //   rawData.password
    // );
    // console.log(user.get({ plain: true }));
    return {
      EM: "Your email/phone or password is incorrect!",
      // EM: "Your email/phone  is incorrect!",
      EC: 2,
      DT: "",
    };

    // if (isEmailExist === false) {
    //   return {
    //     EM: "The email is already exist!",
    //     EC: 1,
    //     DT: "",
    //   };
    // }
  } catch (error) {
    console.log(error);
    return {
      EM: "Something wrongs in service...",
      EC: -2,
    };
  }
};

const updateUserRefreshToken = async (email, token) => {
  try {
    console.log("emial", email, " token: ", token);
    let a = await db.User.update(
      { refresh: token },
      {
        where: { email: email.trim() },
      }
    );
    console.log(a);
  } catch (error) {
    console.log(">>>>> err: ", error);
  }
};

const upsertUserSocialMedia = async (typeAcc, dataRaw) => {
  try {
    let user = null;
    user = await db.User.findOne({
      where: {
        email: dataRaw.email,
        type: typeAcc,
      },
      raw: true,
    });
    if (!user) {
      //create a new account
      user = await db.User.create({
        email: dataRaw.email,
        username: dataRaw.username,
        type: typeAcc,
      });
      user = user.get({ plain: true });
    }
    return user;
  } catch (error) {
    console.log(error);
  }
};

const getUserByRefreshToken = async (token) => {
  try {
    let user = await db.User.findOne({
      where: {
        refreshToken: token,
      },
    });

    if (user) {
      let groupWithRoles = await getGroupWithRole(user);
      return {
        email: user.email,
        groupWithRoles: groupWithRoles,
        username: user.username,
      };
    }

    return null;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  registerNewUser,
  handleUserLogin,
  hashUserPassword,
  checkEmailExits,
  checkPhoneExits,
  updateUserRefreshToken,
  upsertUserSocialMedia,
  getUserByRefreshToken,
};
