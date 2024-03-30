import React, { useState } from "react";

function FollowButton({ isFollowing, onToggleFollow }) {
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    await onToggleFollow();
    setLoading(false);
  };

  return (
    <button onClick={handleFollowToggle} disabled={loading}>
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}

export default FollowButton;
