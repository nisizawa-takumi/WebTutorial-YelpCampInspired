import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import Conversation from "../models/conversation.js";
import httpErrors from "http-errors";

const router = express.Router();

router.get("/conversations", async (req, res) => {
  const convs = await Conversation.find({}).populate("participants").populate("messages.sender");
  res.render("conversations/index", { convs });
});

// 新規作成フォームの表示
router.get("/conversations/new", (req, res) => {
  res.render("conversations/new");
});

router.post("/conversations", async (req, res) => {
  const { participants, messages } = req.body;
  // participants: 配列（ユーザーIDの配列を想定）
  // messages: 初期メッセージ（省略可）

  // Conversationモデルに新しい会話を作成
  const conversation = new Conversation({
    //participants: participants ? participants.map(id => new mongoose.Types.ObjectId(id)) : [],
    participants: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"), //TODO: 後でユーザ機能作って対応
    messages: messages,
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

router.post("/conversations/:id", async (req, res) => {
  const { id } = req.params;
  const { senderId, content } = req.body;
  const newMessage = {
    sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
    content: content,
    createdAt: new Date(),
  };
  await Conversation.findByIdAndUpdate(id, { $push: { messages: newMessage } });
  req.flash("success", "メッセージを送信しました");
  res.redirect(`/conversations/${id}`);
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
