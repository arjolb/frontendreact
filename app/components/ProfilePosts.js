import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";
import Post from "./Post";
import StateContext from "../StateContext";

function ProfilePosts(props) {
  const appState = useContext(StateContext);
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  //axios request - get posts
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/posts`);
        console.log(response.data);
        setPosts(response.data);
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
      {posts.length > 0 &&
        posts.map((post) => {
          return <Post noAuthor={true} post={post} key={post._id} />;
        })}
      {posts.length == 0 && appState.user.username == username && (
        <p className="lead text-muted text-center">
          You haven&rsquo;t created any posts yet; <Link to="/create-post">create one now!</Link>
        </p>
      )}
      {posts.length == 0 && appState.user.username != username && <p className="lead text-muted text-center">{username} hasn&rsquo;t created any posts yet.</p>}
    </div>
  );
}

export default ProfilePosts;
