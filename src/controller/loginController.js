const getLoginPage = (req, res) => {
  const serviceURL = req.query.serviceURL;
  console.log(serviceURL);
  return res.render("login.ejs", { redirectURL: serviceURL });
};
module.exports = {
  getLoginPage,
};
