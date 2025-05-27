import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import User from "../models/user.js";
import httpErrors from "http-errors";

const router = express.Router();

router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("users/index", { users });
});

export default router;
