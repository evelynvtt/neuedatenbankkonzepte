const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: {
    type: String,
    required: true,
    default: "defaultPassword",
  },
  entryDate: { type: Date, default: Date.now },
  following: [{ type: Schema.Types.ObjectId, ref: "users", default: [] }],
  followers: [{ type: Schema.Types.ObjectId, ref: "users", default: [] }],
});

const tweetSchema = new Schema({
  tweet: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

const commentSchema = new Schema({
  comment: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  tweet: { type: Schema.Types.ObjectId, ref: "tweets" },
});

const Users = mongoose.model("users", userSchema, "users");
const Tweets = mongoose.model("tweets", tweetSchema, "tweets");
const Comments = mongoose.model("comments", commentSchema, "comments");

module.exports = { Users, Comments, Tweets };
