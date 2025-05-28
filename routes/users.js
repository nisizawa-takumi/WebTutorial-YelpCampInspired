import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import User from "../models/user.js";
import httpErrors from "http-errors";
import passport from "passport";
import passportLocal from "passport-local";

const router = express.Router();

// ユーザー登録ページ表示
router.get("/register", (req, res) => {
  res.render("users/register");
});

// ユーザー登録処理
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username });
    await User.register(user, password);
    req.flash("success", "ユーザー登録が完了しました。");
    req.login(user, (err) => {
      if (err) return next(err);
    });
    res.redirect("/login");
  } catch (e) {
    req.flash("error", "ユーザー登録に失敗しました。ユーザー名が既に使われている可能性があります。");
    res.redirect("/register");
  }
});

// ログインページ表示
router.get("/login", (req, res) => {
  res.render("users/login");
});

// ログイン処理
router.post(
  "/login",
  (req, res, next) => {
    // returnToを一時退避
    res.locals.returnTo = req.session.returnTo;
    next();
  },
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "ログインしました。");
    // 一時退避したreturnToを使う
    const redirectUrl = res.locals.returnTo || "/users";
    delete req.session.returnTo; //passportはログイン時セッション消すが、一応明示的に消しておく
    res.redirect(redirectUrl);
  }
);

// ログアウト
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "ログアウトしました。");
    res.redirect("/");
  });
});

router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("users/index", { users });
});

export default router;
