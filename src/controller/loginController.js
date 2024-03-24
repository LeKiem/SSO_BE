const getLoginPage = (req, res) => {
  const arrMesage = req.flash("data");

  const error = arrMesage[0] ? arrMesage[0] : "";
  const usernameInput = arrMesage[1] ? arrMesage[1] : "";
  return res.render("login.ejs", {
    error: error,
    usernameInput: usernameInput,
  });
};

module.exports = {
  getLoginPage,
};
