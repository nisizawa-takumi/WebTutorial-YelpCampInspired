import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import url from "url";
// サンプル会話データ
const conversations = [
  {
    participants: [
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"), // taro
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a2"), // hanako
    ],
    messages: [
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"),
        content: "こんにちは、はなこさん！",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a2"),
        content: "こんにちは、たろうさん！元気ですか？",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"),
        content: "元気です！週末は何をしましたか？",
      },
    ],
  },
  {
    participants: [
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"), // taro
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"), // AI_Bot
    ],
    messages: [
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"),
        content: "AI_Bot、今日の天気は？",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
        content: "こんにちは、たろうさん。今日の天気は晴れです！",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a1"),
        content: "ありがとう！明日の予定は？",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
        content: "明日は雨の予報です。傘を忘れずに！",
      },
    ],
  },
  {
    participants: [
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a2"), // hanako
      new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"), // AI_Bot
    ],
    messages: [
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a2"),
        content: "AI_Bot、自己紹介して！",
      },
      {
        sender: new mongoose.Types.ObjectId("64a1f1e1a1a1a1a1a1a1a1a3"),
        content: "私はAI_Botです。あなたの質問に何でも答えます！",
      },
    ],
  },
];

async function seedConversations() {
  await Conversation.deleteMany({});
  await Conversation.insertMany(conversations);
  console.log("会話シードデータ初期化完了");
}

export default seedConversations;

// このファイルが直接実行された場合のみseedConversations();を呼ぶ
if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  (async () => {
    await mongoose.connect("mongodb://localhost:27017/talkWithFriendWithAI");
    await seedConversations();
    await mongoose.disconnect();
  })();
}
