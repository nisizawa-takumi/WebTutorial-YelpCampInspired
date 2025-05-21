import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true }, // ユーザ名
  password: { type: String, required: true }, // パスワード（ハッシュ化推奨）
  createdAt: { type: Date, default: Date.now }, // 作成日時
  // 必要に応じて他のフィールドも追加可能
});

export default mongoose.model("User", UserSchema);
