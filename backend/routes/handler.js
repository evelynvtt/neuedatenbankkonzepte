const express = require("express");
const router = express.Router();
const Schemas = require("../models/Schemas.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuth = require("../middleware/isAuth.js");
const { Users } = require("../models/Schemas.js");

router.post("/register", async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new Schemas.Users({
      username,
      fullname,
      password: hashedPassword,
    });
    const result = await newUser.save();
    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering new user." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let user;
  try {
    user = await Schemas.Users.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: "User does not exist." });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(401).json({ message: "Password is incorrect." });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      "123456789",
      { expiresIn: "24h" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: "Server error during authentication." });
  }
});

router.delete("/tweet/:tweetId", isAuth, async (req, res) => {
  try {
    const tweet = await Schemas.Tweets.findById(req.params.tweetId);
    if (!tweet) {
      return res.status(404).send("Tweet not found.");
    }
    if (tweet.user.toString() !== req.userId.toString()) {
      return res.status(403).send("Unauthorized.");
    }
    await Schemas.Tweets.deleteOne({ _id: req.params.tweetId });
    res.send("Tweet deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting tweet.");
  }
});

router.delete("/comment/:commentId", isAuth, async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.userId;

  try {
    const comment = await Schemas.Comments.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const tweet = await Schemas.Tweets.findById(comment.tweet);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    if (
      comment.user.toString() !== userId &&
      tweet.user.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment." });
    }

    await Schemas.Comments.deleteOne({ _id: commentId });

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment." });
  }
});

router.get("/tweets", async (req, res) => {
  try {
    const tweets = await Schemas.Tweets.find({})
      .populate("user")
      .populate({
        path: "comments",
        populate: { path: "user", model: "users" },
      })
      .exec();
    res.json(tweets);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch tweets.");
  }
});

router.get("/users", isAuth, async (req, res) => {
  try {
    const users = await Schemas.Users.find({}, "username fullname").exec();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Failed to fetch users.");
  }
});

router.get("/user/following", isAuth, async (req, res) => {
  try {
    const user = await Schemas.Users.findById(req.userId).populate(
      "following",
      "username fullname"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user.following);
  } catch (error) {
    console.error("Error fetching followed users:", error);
    res.status(500).send("Error fetching followed users.");
  }
});

router.get("/user/likedTweets", isAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const userTweets = await Schemas.Tweets.find({ likes: userId }).populate(
      "user"
    );
    res.json(userTweets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching liked tweets.");
  }
});

router.post("/like/:tweetId", isAuth, async (req, res) => {
  const tweetId = req.params.tweetId;
  const userId = req.userId;
  try {
    const tweet = await Schemas.Tweets.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    if (tweet.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Tweet already liked by this user." });
    }

    tweet.likes.push(userId);

    await tweet.save();

    res.status(200).json({ message: "Tweet liked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error liking tweet." });
  }
});

router.delete("/like/:tweetId", isAuth, async (req, res) => {
  const tweetId = req.params.tweetId;
  const userId = req.userId;
  try {
    const tweet = await Schemas.Tweets.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    if (!tweet.likes.includes(userId)) {
      return res.status(400).json({ message: "Tweet not liked by this user." });
    }

    tweet.likes.pull(userId);

    await tweet.save();

    res.status(200).json({ message: "Tweet unliked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unliking tweet." });
  }
});

router.post("/comment/:tweetId", isAuth, async (req, res) => {
  const tweetId = req.params.tweetId;
  const userId = req.userId;
  const commentContent = req.body.comment;

  try {
    const tweet = await Schemas.Tweets.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    const newComment = new Schemas.Comments({
      comment: commentContent,
      user: userId,
      tweet: tweetId,
    });

    const savedComment = await newComment.save();

    tweet.comments.push(savedComment._id);
    await tweet.save();

    res.status(200).json({ message: "Comment added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment." });
  }
});

router.post("/addTweet", isAuth, async (req, res) => {
  const userTweet = req.body.tweet;

  try {
    const newTweet = new Schemas.Tweets({
      tweet: userTweet,
      user: req.userId,
    });

    const newTweetResults = await newTweet.save();
    res.redirect("/tweets");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving tweet.");
  }
});

router.post("/follow/:userId", isAuth, async (req, res) => {
  const currentUserId = req.userId;
  const { userId } = req.params;

  if (userId === currentUserId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const userToFollow = await Schemas.Users.findById(userId);
    const currentUser = await Schemas.Users.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found." });
    }

    if (
      currentUser.following
        .map((id) => id.toString())
        .includes(userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "You are already following this user." });
    }

    currentUser.following.push(userId);
    await currentUser.save();

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.status(200).json({ message: "Followed the user successfully." });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Error processing follow request." });
  }
});

router.delete("/unfollow/:userId", isAuth, async (req, res) => {
  const currentUserId = req.userId;
  const { userId } = req.params;

  try {
    await Schemas.Users.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });

    await Schemas.Users.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    res.json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Error processing unfollow request." });
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await Schemas.Users.findById(userId)
      .populate("following", "username fullname")
      .populate("followers", "username fullname");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const tweets = await Schemas.Tweets.find({ user: user._id })
      .populate("comments")
      .populate("likes");

    res.json({ user, tweets });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Failed to fetch user profile.");
  }
});

module.exports = router;
