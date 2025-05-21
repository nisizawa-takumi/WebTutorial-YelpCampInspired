import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.get("/", (req, res) => {
  res.send("ルートパスを受け取りました");
});

app.listen(3000, () => {
  console.log("サーバーがリクエストを受け付け始めました");
});
// app.listen()は**「サーバーを起動してリクエスト待ち状態にする」命令**です。
// それまでにルーティング（app.getやapp.post）やミドルウェアの設定（app.use）など、すべてのサーバー設定を先に記述する必要があります。
// 最初にapp.listen()を書いてしまうと、サーバーが起動した時点でまだルートや設定が終わっていないため、思った通りに動かなくなることがあります。
