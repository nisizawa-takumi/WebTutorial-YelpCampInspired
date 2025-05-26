import express from "express";
import url from "url";
import path from "path";
import mongoose from "mongoose";
import methodOverride from "method-override";
import Conversation from "./models/conversation.js";
import User from "./models/user.js";
import ejsMate from "ejs-mate";
import httpErrors from "http-errors";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await mongoose
  .connect("mongodb://localhost:27017/talkWithFriendWithAI") //chatGPT:最新のMongoose（v6以降）では useNewUrlParser と useUnifiedTopology の指定は不要です。（これらのオプションはデフォルトで有効になっています）
  .then(() => {
    console.log("MongoDBにつながりました。");
  })
  .catch((err) => {
    console.log("MongoDBとの接続でエラーが発生しました。");
    console.error(err);
  });

//ーーーーseed読み込み　※開発用。この関数で毎回DBがリセットされるので注意ーーーー
import refleshUserCollectionBySeed from "./seeds/users.js";
import refleshConversationCollectionBySeed from "./seeds/conversations.js";
// await refleshUserCollectionBySeed();
// await refleshConversationCollectionBySeed();
// Conversation.find({}).then(console.log);
// User.find({}).then(console.log);
//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/conversations", async (req, res) => {
  const convs = await Conversation.find({}).populate("participants").populate("messages.sender");
  res.render("conversations/index", { convs });
});

// 新規作成フォームの表示
app.get("/conversations/new", (req, res) => {
  res.render("conversations/new");
});

app.post("/conversations/new", async (req, res) => {
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
app.get("/conversations/:id", async (req, res) => {
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

app.post("/conversations/:id", async (req, res) => {
  const { id } = req.params;
  const { senderId, content } = req.body;
  const newMessage = {
    sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
    content: content,
    createdAt: new Date(),
  };
  await Conversation.findByIdAndUpdate(id, { $push: { messages: newMessage } });
  res.redirect(`/conversations/${id}`);
});

app.get("/conversations/:convId/messages/:mesId", async (req, res) => {
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

app.patch("/conversations/:convId/messages/:mesId", async (req, res) => {
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
  res.redirect(`/conversations/${convId}`);
});

app.delete("/conversations/:convId/messages/:mesId", async (req, res) => {
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
  res.redirect(`/conversations/${convId}`);
});

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("users/index", { users });
});

app.use((req, res, next) => {
  throw httpErrors(404, "指定されたページが見つかりません。");
});

/**
 * エラーハンドリングミドルウェア
 * ルートで発生したエラーをキャッチして適切なレスポンスを返す
 */
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "エラーメッセージ未定義";
  res.status(status).render("error", { status, message });
  console.log("--------↓明示的なエラー出力↓---------");
  console.error(err.stack || "スタックトレース未定義");
  console.log("--------↑----------------↑----------");
});

app.listen(3000, () => {
  console.log("サーバーがリクエストを受け付け始めました");
});
// app.listen()は**「サーバーを起動してリクエスト待ち状態にする」命令**です。
// それまでにルーティング（app.getやapp.post）やミドルウェアの設定（app.use）など、すべてのサーバー設定を先に記述する必要があります。
// 最初にapp.listen()を書いてしまうと、サーバーが起動した時点でまだルートや設定が終わっていないため、思った通りに動かなくなることがあります。
