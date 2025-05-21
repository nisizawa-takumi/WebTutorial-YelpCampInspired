import mongoose from "mongoose";
import { Schema } from "mongoose";

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  content: String,
  sentAt: { type: Date, default: Date.now },
});
// このコードは、Mongooseを使って「メッセージ」データの構造（スキーマ）を定義しています。
// sender フィールドは、メッセージの送信者を表します。Schema.Types.ObjectId 型で、
// MongoDBの他のコレクション（ここでは "User"）のドキュメントを参照するためのIDです。
// ref: "User" により、populate メソッドを使ってユーザー情報を取得できるようになります。→多分リレーショナルデータベースのイメージ
// content フィールドは、メッセージ本文を格納する文字列型のフィールドです。
// sentAt フィールドは、メッセージが送信された日時を記録します。型は Date で、
// デフォルト値として Date.now（現在時刻）が自動的に設定されます。
// このスキーマを使うことで、MongoDBに保存するメッセージデータの形式や制約を統一できます。

const ConversationSchema = Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});
// このコードは、Mongooseを使って「会話（Conversation）」データの構造（スキーマ）を定義しています。
// participants フィールドは、会話に参加しているユーザーのIDを配列で保持します。
// 各要素は Schema.Types.ObjectId 型で、ref: "User" により「User」コレクションのユーザーを参照します。
// これにより、会話の参加者情報を後から取得（populate）できます。
// messages フィールドは、会話内のメッセージを MessageSchema の配列として保存します。
// これにより、1つの会話ドキュメント内に複数のメッセージを埋め込む形で管理できます。
// createdAt フィールドは、会話が作成された日時を記録します。
// 型は Date で、デフォルト値として Date.now（現在時刻）が自動的に設定されます。
// このスキーマを使うことで、会話ごとに参加者・メッセージ・作成日時を一元的に管理でき、
// MongoDBに保存するデータの形式や制約を統一できます。

export default mongoose.model("Conversation", ConversationSchema);
// スキーマの中にスキーマを入れても、エクスポートするときにある一つのモデルとして定義しているから、
// コレクションとしては1つだけ定義される？
// はい、その通りです。
// Mongooseでは、スキーマの中に別のスキーマ（サブスキーマ）を入れることができます。
// この場合、ConversationSchema の中に MessageSchema を配列として組み込んでいますが、
// エクスポートしているのは Conversation モデルだけなので、
// MongoDB上で作成されるコレクション（テーブルのようなもの）は「conversations」1つだけです。
// messages フィールドは、conversations コレクションの各ドキュメント内に「埋め込み配列」として保存されます。
// つまり、messages はサブドキュメントとして1つのコレクション（conversations）内に格納され、
// messages 専用のコレクションが新たに作られることはありません。
