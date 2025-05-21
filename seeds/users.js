import mongoose from "mongoose";
import User from "../models/user.js";
import url from "url";
// サンプルユーザー（AI含む）
const users = [
  {
    _id: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"),
    username: "taro",
    password: "password123",
  },
  {
    _id: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a2"),
    username: "hanako",
    password: "password456",
  },
  {
    _id: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
    username: "AI_Bot",
    password: "ai_secret",
  },
];

async function seedUsers() {
  await User.deleteMany({});
  await User.insertMany(users);
  console.log("ユーザーシードデータ初期化完了");
}

export default seedUsers;

// このファイルが直接実行された場合のみseedUsers()を呼ぶ
if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  (async () => {
    await mongoose.connect("mongodb://localhost:27017/talkWithFriendWithAI");
    await seedUsers();
    await mongoose.disconnect();
  })();
}
