import mongoose from "mongoose";
import { Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new Schema({
  // username: passportLocalMongoose側で定義
  // password: passportLocalMongoose側で定義
  createdAt: { type: Date, default: Date.now }, // 作成日時
  // 必要に応じて他のフィールドも追加可能
});

UserSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    // "No password was given"
    MissingPasswordError: "パスワードが入力されていません",
    // "Account is currently locked. Try again later"
    AttemptTooSoonError: "アカウントが一時的にロックされています。後でもう一度お試しください",
    // "Account locked due to too many failed login attempts"
    TooManyAttemptsError: "ログイン試行回数が多すぎるため、アカウントがロックされました",
    // "Authentication not possible. No salt value stored"
    NoSaltValueStoredError: "認証できません。ソルト値が保存されていません",
    // "Password or username are incorrect"
    IncorrectPasswordError: "ユーザー名またはパスワードが正しくありません",
    // "Password or username are incorrect"
    IncorrectUsernameError: "ユーザー名またはパスワードが正しくありません",
    // "No username was given"
    MissingUsernameError: "ユーザー名が入力されていません",
    // "A user with the given username is already registered"
    UserExistsError: "このユーザー名は既に登録されています",
  },
});

export default mongoose.model("User", UserSchema);
