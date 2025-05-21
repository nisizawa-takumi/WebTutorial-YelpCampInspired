import express from "express";
import url from "url";
import path from "path";
import mongoose from "mongoose";
import Conversation from "./models/conversation.js";
import User from "./models/user.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await mongoose
  .connect("mongodb://localhost:27017/talkWithFriendWithAI") //chatGPT:最新のMongoose（v6以降）では useNewUrlParser と useUnifiedTopology の指定は不要です。（これらのオプションはデフォルトで有効になっています）
  .then(() => {
    console.log("MongoDBにつながりました。");
  })
  .catch((err) => {
    console.log("MongoDBとの接続でエラーが発生しました。");
    console.log(err);
  });

//ーーーーseed読み込み　※開発用。この関数で毎回DBがリセットされるので注意ーーーー
import refleshUserCollectionBySeed from "./seeds/users.js";
import refleshConversationCollectionBySeed from "./seeds/conversations.js";
// refleshUserCollectionBySeed();
// refleshConversationCollectionBySeed();
//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/conversations", async (req, res) => {
  const convs = await Conversation.find({})
    .populate("participants")
    .populate("messages.sender");
  res.render("conversations/index", { convs });
});

// 会話IDを指定して個別の会話ページを表示するルート
app.get("/conversations/:id", async (req, res) => {
  // URLパラメータから会話IDを取得
  const { id } = req.params;

  // 会話IDがMongoDBのObjectIdとして有効かどうかをチェック
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // 無効なIDの場合は400エラーを返す
    return res
      .status(400)
      .send(
        "指定された会話が見つかりません。(開発者へ: IDがObjectId形式ではないです)"
      ); //エラー400（Bad Request）は、クライアントから送信されたリクエストが不正である場合に返されるHTTPステータスコード
  }
  const conversation = await Conversation.findById(id)
    .populate("participants")
    .populate("messages.sender");

  // 会話が見つからなかった場合は404エラーを返す
  if (!conversation) {
    return res.status(404).send("指定された会話が見つかりません。"); //404エラー（Not Found）は、クライアントがリクエストしたリソース（ページやデータなど）がサーバー上に存在しない場合に返されるHTTPステータスコードです。
  } else {
    // 会話が見つかった場合はチャット画面を表示
    res.render("conversations/chat", { conversation });
  }
});

app.listen(3000, () => {
  console.log("サーバーがリクエストを受け付け始めました");
});
// app.listen()は**「サーバーを起動してリクエスト待ち状態にする」命令**です。
// それまでにルーティング（app.getやapp.post）やミドルウェアの設定（app.use）など、すべてのサーバー設定を先に記述する必要があります。
// 最初にapp.listen()を書いてしまうと、サーバーが起動した時点でまだルートや設定が終わっていないため、思った通りに動かなくなることがあります。
