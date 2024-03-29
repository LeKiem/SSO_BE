import userApiService from "../service/userApiService";
const readFunc = async (req, res) => {
  try {
    if (req.query.page && req.query.limit) {
      // console.log(req.query);
      let page = req.query.page;
      let limit = req.query.limit;
      let data = await userApiService.getUserWithPagination(+page, +limit);
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC, //
        DT: data.DT,
      });
    } else {
      let data = await userApiService.getAllUser();
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC, //
        DT: data.DT,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "eror from server",
      EC: -1, //
      DT: "",
    });
  }
};
const createFunc = async (req, res) => {
  try {
    let data = await userApiService.createUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC, //
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "eror from server",
      EC: -1, //
      DT: "",
    });
  }
};
const updateFunc = async (req, res) => {
  try {
    console.log("Cookies: ", req.cookies);
    let data = await userApiService.updateUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC, //
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "eror from server",
      EC: -1, //
      DT: "",
    });
  }
};
const deleteFunc = async (req, res) => {
  try {
    let data = await userApiService.deleteUser(req.body.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC, //
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "eror from server",
      EC: -1, //
      DT: "",
    });
  }
};
const getUserAccount = async (req, res) => {
  // setTimeout(() => {
  return res.status(200).json({
    EM: "OK",
    EC: 0, //
    DT: {
      access_token: req.user.access_token,
      refresh_token: req.user.refresh_token,
      groupWithRoles: req.user.groupWithRoles,
      email: req.user.email,
      username: req.user.username,
    },
  });
  // }, 5000);
};
module.exports = {
  readFunc,
  createFunc,
  updateFunc,
  deleteFunc,
  getUserAccount,
};
