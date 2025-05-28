import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import Conversation from "../models/conversation.js";
import httpErrors from "http-errors";
import { isAuthenticated } from "../middleware.js";
import User from "../models/user.js"; // Userモデルのインポートを追加

const router = express.Router();

router.get("/conversations", async (req, res) => {
  const convs = await Conversation.find({}).populate("participants").populate("messages.sender");
  res.render("conversations/index", { convs });
});

// 新規作成フォームの表示
router.get("/conversations/new", isAuthenticated, (req, res) => {
  res.render("conversations/new");
});

router.post("/conversations", isAuthenticated, async (req, res) => {
  const { participants, message } = req.body;
  // participants: usernameのカンマ区切り文字列
  // messages: 初期メッセージ（省略可）

  // 参加者のusernameを配列に分割し、UserモデルからIDを取得
  let participantUsernames = [];
  if (participants && typeof participants === "string") {
    participantUsernames = participants
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  } //※trimしてからFalsyか見ると空白や空文字列を除外できる

  // ログインユーザー自身も必ず含める
  const allUsernames = Array.from(new Set([req.user.username, ...participantUsernames]));
  const users = await User.find({ username: { $in: allUsernames } });
  const foundUsernames = users.map((u) => u.username);

  // 存在しないユーザー名があるかチェック
  const notFoundUsernames = allUsernames.filter((u) => !foundUsernames.includes(u));
  if (notFoundUsernames.length > 0) {
    req.flash("error", `存在しないユーザー: ${notFoundUsernames.join(", ")}`);
    return res.redirect("/conversations/new");
  }

  const participantIds = users.map((u) => u._id);

  let newMessage;
  if (message) {
    newMessage = {
      sender: req.user._id,
      content: message,
      createdAt: new Date(),
    };
  }

  const conversation = new Conversation({
    participants: participantIds,
    messages: message ? [newMessage] : [],
    createdAt: new Date(),
  });

  await conversation.save();

  // 作成後、会話一覧ページへリダイレクト
  res.redirect("/conversations");
});

// 会話IDを指定して個別の会話ページを表示するルート
router.get("/conversations/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpErrors(400, "指定された会話が見つかりません。(開発者へ: IDがObjectId形式ではないです)");
  }
  const conversation = await Conversation.findById(id).populate("participants").populate("messages.sender");
  if (!conversation) {
    throw httpErrors(404, "指定された会話が見つかりません。");
  } else {
    res.render("conversations/chat", { conversation });
  }
});

// router.post("/conversations/:id", async (req, res) => {
//   const { id } = req.params;
//   const { senderId, content } = req.body;
//   const newMessage = {
//     sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
//     content: content,
//     createdAt: new Date(),
//   };
//   await Conversation.findByIdAndUpdate(id, { $push: { messages: newMessage } });
//   req.flash("success", "メッセージを送信しました");
//   res.redirect(`/conversations/${id}`);
// });
router.post("/conversations/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { senderId, content } = req.body;
  const conv = await Conversation.findById(id);
  if (!conv) {
    req.flash("error", "指定された会話が見つかりません。");
    return res.redirect("/conversations");
  }
  // 参加者にcurrentUserが含まれているかチェック
  if (!conv.participants.some((p) => p.equals(req.user._id))) {
    req.flash("error", "この会話に参加していません。");
    return res.redirect(`/conversations/${id}`);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    createdAt: new Date(),
  };
  await Conversation.findByIdAndUpdate(id, { $push: { messages: newMessage } });
  req.flash("success", "メッセージを送信しました");
  res.redirect(`/conversations/${id}`);
});

router.delete("/conversations/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpErrors(400, "指定された会話が見つかりません。(開発者へ: IDがObjectId形式ではないです)");
  }
  const conversation = await Conversation.findByIdAndDelete(id);
  if (!conversation) {
    throw httpErrors(404, "指定された会話が見つかりません。");
  }
  req.flash("success", "会話を削除しました");
  res.redirect("/conversations");
});

router.get("/conversations/:convId/messages/:mesId", async (req, res) => {
  const { convId, mesId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(convId) || !mongoose.Types.ObjectId.isValid(mesId)) {
    throw httpErrors(400, "指定されたメッセージが見つかりません。(開発者へ: IDがObjectId形式ではないです)");
  }
  const conversation = await Conversation.findById(convId).populate("participants").populate("messages.sender");
  if (!conversation) {
    throw httpErrors(404, "指定された会話が見つかりません。");
  }
  const message = conversation.messages.id(mesId);
  if (!message) {
    throw httpErrors(404, "指定されたメッセージが見つかりません。");
  }
  res.render("conversations/message", { conversation, message });
});

router.patch("/conversations/:convId/messages/:mesId", async (req, res) => {
  const { convId, mesId } = req.params;
  const { updatedMessage } = req.body;
  if (!mongoose.Types.ObjectId.isValid(convId) || !mongoose.Types.ObjectId.isValid(mesId)) {
    throw httpErrors(400, "指定されたメッセージが見つかりません。(開発者へ: IDがObjectId形式ではないです)");
  }
  const conversation = await Conversation.findById(convId);
  if (!conversation) {
    throw httpErrors(404, "指定された会話が見つかりません。");
  }
  const message = conversation.messages.id(mesId);
  if (!message) {
    throw httpErrors(404, "指定されたメッセージが見つかりません。");
  }
  message.content = updatedMessage;
  await conversation.save();
  req.flash("success", "メッセージを編集しました");
  res.redirect(`/conversations/${convId}`);
});

router.delete("/conversations/:convId/messages/:mesId", async (req, res) => {
  const { convId, mesId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(convId) || !mongoose.Types.ObjectId.isValid(mesId)) {
    throw httpErrors(400, "指定されたメッセージが見つかりません。(開発者へ: IDがObjectId形式ではないです)");
  }
  const conversation = await Conversation.findById(convId);
  if (!conversation) {
    throw httpErrors(404, "指定された会話が見つかりません。");
  }
  const message = conversation.messages.id(mesId);
  if (!message) {
    throw httpErrors(404, "指定されたメッセージが見つかりません。");
  }
  conversation.messages.pull(mesId);
  await conversation.save();
  req.flash("success", "メッセージを削除しました");
  res.redirect(`/conversations/${convId}`);
});

export default router;
