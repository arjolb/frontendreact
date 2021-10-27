import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";
import StateContext from "../StateContext";

function ProfileFollowing(props) {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const appState = useContext(StateContext);

  //axios request - get posts
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/following`);
        console.log(response.data);
        setFollowing(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchPosts();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingIcon />;

  return (
    <div className="list-group">
      {following.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        );
      })}
      {following.length == 0 && appState.user.username != username && <p className="lead text-muted text-center">{username} is not following anyone yet</p>}
      {following.length == 0 && appState.user.username == username && <p className="lead text-muted text-center">You are not following anyone yet</p>}
    </div>
  );
}

export default ProfileFollowing;
