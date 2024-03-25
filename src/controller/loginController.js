const getLoginPage = (req, res) => {
  const serviceURL = req.query.serviceURL;
  console.log(serviceURL);
  return res.render("login.ejs", { redirectURL: serviceURL });
};

const verifySSOToken = (req, res) => {
  return res.status(200).json({
    EM: "OK",
    EC: 0,
    DT: req.body.ssoToken,
  });
};
module.exports = {
  getLoginPage,
  verifySSOToken,
};
