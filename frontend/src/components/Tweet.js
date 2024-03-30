import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as faHeartEmpty,
  faTrashAlt,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartFull } from "@fortawesome/free-solid-svg-icons";
import "./all.css";

function Tweet() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [likedTweets, setLikedTweets] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      alert("Please log in to tweet.");
      navigate("/login");
    } else {
      fetchItems();
      fetchLikedTweets();
      fetchUsers();
      fetchFollowedUsers();
    }
  }, [isLoggedIn, navigate]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/tweets");
      if (response.ok) {
        const items = await response.json();
        setItems(items);
      } else {
        console.error("Server didn't respond with JSON");
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tweetInput = formData.get("tweetInput");

    if (!isLoggedIn) {
      alert("Please log in to tweet.");
      return;
    }

    try {
      const response = await fetch("/addTweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ tweet: tweetInput }),
      });

      if (response.ok) {
        alert("Tweet added successfully!");
        fetchItems();
      } else {
        const errorData = await response.json();
        alert(`Failed to add tweet: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding tweet:", error);
      alert("An error occurred while adding tweet.");
    }
  };

  const handleComment = async (tweetId) => {
    const commentContent = commentInput;
    if (!isLoggedIn || !commentContent.trim()) {
      alert("Please log in to comment and enter a valid comment.");
      return;
    }

    try {
      const response = await fetch(`/comment/${tweetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ comment: commentContent }),
      });

      if (response.ok) {
        alert("Comment added successfully!");
        setCommentInput("");
        fetchItems();
      } else {
        const errorData = await response.json();
        alert(`Failed to add comment: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again later.");
    }
  };

  const fetchLikedTweets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await fetch("/user/likedTweets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch liked tweets");
      }
      const likedTweetsData = await response.json();
      setLikedTweets(likedTweetsData.map((tweet) => tweet._id));
    } catch (error) {
      console.error("Error fetching liked tweets:", error);
    }
  };

  const handleLike = async (tweetId) => {
    if (!isLoggedIn) {
      alert("Please log in to like.");
      return;
    }

    const isLiked = likedTweets.includes(tweetId);

    try {
      const response = await fetch(`/like/${tweetId}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert(
          isLiked ? "Tweet unliked successfully!" : "Tweet liked successfully!"
        );
        fetchLikedTweets();
      } else {
        throw new Error("Failed to like/unlike tweet.");
      }
    } catch (error) {
      console.error("Error liking/unliking tweet:", error);
      alert("Failed to like/unlike tweet. Please try again later.");
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!isLoggedIn) {
      alert("Please log in to delete tweet.");
      return;
    }

    try {
      const response = await fetch(`/tweet/${tweetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.ok) {
        alert("Tweet deleted successfully!");
        fetchItems();
      } else {
        throw new Error("Failed to delete tweet.");
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete tweet. Please try again later.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLoggedIn) {
      alert("Please log in to delete comment.");
      return;
    }

    try {
      const response = await fetch(`/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.ok) {
        alert("Comment deleted successfully!");
        fetchItems();
      } else {
        throw new Error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again later.");
    }
  };
  const fetchFollowedUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await fetch("/user/following", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch followed users");
      }
      const followedUsersData = await response.json();
      setFollowedUsers(followedUsersData.map((user) => user._id));
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFollow = async (userId) => {
    if (!isLoggedIn) {
      alert("Please log in to follow or unfollow.");
      return;
    }

    const isFollowing = followedUsers.includes(userId);

    const method = isFollowing ? "DELETE" : "POST";
    const endpoint = isFollowing ? `/unfollow/${userId}` : `/follow/${userId}`;

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert(
          isFollowing ? "Unfollowed successfully!" : "Followed successfully!"
        );
        fetchFollowedUsers();
      } else {
        const errorData = await response.json();
        throw new Error(
          `Failed to ${isFollowing ? "unfollow" : "follow"} user: ${
            errorData.message
          }`
        );
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      alert(`Failed to follow/unfollow user: ${error.message}`);
    }
  };

  function FollowButton({ isFollowing, onToggleFollow }) {
    const [loading, setLoading] = useState(false);

    const handleFollowToggle = async () => {
      setLoading(true);
      await onToggleFollow();
      setLoading(false);
    };

    const buttonClasses = `btn-action ${isFollowing ? "active" : ""}`;

    return (
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={buttonClasses}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    );
  }

  return (
    <section>
      <div className="container-fluid">
        <form onSubmit={handleSubmit} className="tweet-form">
          <input
            type="text"
            name="tweetInput"
            className="form-control tweet-input"
            placeholder="What's happening?"
          />
          <div className="center-container">
            <button type="submit" className="btn tweet-btn btn-margin-bottom">
              Post
            </button>
          </div>
        </form>
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search tweets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {items
          .filter((item) =>
            item.tweet.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => {
            if (!item || !item.user) {
              return null;
            }
            return (
              <div key={item._id} className="tweet-container">
                <div className="tweet-box">
                  <div className="tweet-header">
                    <span className="username">{item.user.fullname}</span>
                    <span className="user-handle">(@{item.user.username})</span>
                    <FollowButton
                      isFollowing={followedUsers.includes(item.user._id)}
                      onToggleFollow={() => handleFollow(item.user._id)}
                    />
                  </div>
                  <div className="tweet-content-box">
                    <p className="tweet-content">{item.tweet}</p>
                    {isLoggedIn &&
                      item.user._id === localStorage.getItem("userId") && (
                        <button
                          onClick={() => handleDeleteTweet(item._id)}
                          className="delete-tweet-btn"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                  </div>
                  <div className="tweet-actions">
                    <button
                      onClick={() => handleLike(item._id)}
                      className={`like-btn ${
                        likedTweets.includes(item._id) ? "liked" : ""
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          likedTweets.includes(item._id)
                            ? faHeartFull
                            : faHeartEmpty
                        }
                      />
                    </button>
                  </div>
                </div>
                <div className="comment-section">
                  {item.comments.map((comment) => (
                    <div key={comment._id} className="comment-box">
                      <span className="comment-author">
                        @{comment.user.username}
                      </span>
                      <p className="comment-content">{comment.comment}</p>
                      {isLoggedIn &&
                        comment.user._id === localStorage.getItem("userId") && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="delete-comment-btn"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        )}
                    </div>
                  ))}
                  <div className="add-comment-box">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="comment-input"
                      placeholder="Add a comment..."
                    />
                    <button
                      onClick={() => handleComment(item._id)}
                      className="comment-btn"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export default Tweet;
