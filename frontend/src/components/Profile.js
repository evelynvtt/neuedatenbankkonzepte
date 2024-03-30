import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./profile.css";

function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  console.log("UserId from URL:", userId);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch(`/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.log("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [userId]);

  if (!profile || !profile.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>
          {profile.user.fullname} (@{profile.user.username})
        </h2>
      </div>
      <div className="profile-stats">
        <div>
          <strong>Following:</strong> {profile.user.following.length}
        </div>
        |
        <div>
          <strong>Followers:</strong> {profile.user.followers.length}
        </div>
      </div>
      <h3>Tweets</h3>
      <div className="tweets">
        {profile.tweets.map((tweet) => (
          <div key={tweet._id} className="tweet">
            <div className="tweet-text">{tweet.tweet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
