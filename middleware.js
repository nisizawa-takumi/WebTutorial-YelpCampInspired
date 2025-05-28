export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "この操作にはログインをお願いします");
  // returnToを一時退避
  console.log(req.originalUrl);
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};
