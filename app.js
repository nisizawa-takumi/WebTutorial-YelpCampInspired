import express from "express";
import url from "url";
import path from "path";
import mongoose from "mongoose";
import methodOverride from "method-override";
import ejsMate from "ejs-mate";
import httpErrors from "http-errors";
import session from "express-session";
import flash from "connect-flash";

import conversationRoutes from "./routes/conversations.js";
import userRoutes from "./routes/users.js";

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
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "temp", //TODO: 後でセキュリティ上安全なようにする、本当は直書きしてはいけないらしい
  resave: false,
  saveUninitialized: true, //TODO: 後でfalseにする。開発用にtrueにしておく（セッションがいつでも配られてブラウザから見れるため。）
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 3600 * 24 * 7, //=1週間
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", conversationRoutes);
app.use("/", userRoutes);

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
  if (req.originalUrl.startsWith("/.well-known/")) {
    // Chrome DevToolsや拡張機能などの特殊リクエストはサイレントに404を返す
    console.warn("404 Not Found:", req.method, req.originalUrl, "(無視していいらしい？)");
    return res.sendStatus(404);
  } else {
    res.status(status).render("error", { status, message });
    console.log("--------↓明示的なエラー出力↓---------");
    console.error(err.stack || "スタックトレース未定義");
    console.log("--------↑----------------↑----------");
  }
});

app.listen(3000, () => {
  console.log("サーバーがリクエストを受け付け始めました");
});
// app.listen()は**「サーバーを起動してリクエスト待ち状態にする」命令**です。
// それまでにルーティング（app.getやapp.post）やミドルウェアの設定（app.use）など、すべてのサーバー設定を先に記述する必要があります。
// 最初にapp.listen()を書いてしまうと、サーバーが起動した時点でまだルートや設定が終わっていないため、思った通りに動かなくなることがあります。
