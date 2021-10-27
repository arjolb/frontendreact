import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingIcon from "./LoadingIcon";
import ReactMarkdown from "react-markdown";
import ReactToolTip from "react-tooltip";
import NotFound from "./NotFound";

function ViewSinglePost(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [notFound, setNotFound] = useState(false);
  const [authorPost, setAuthorPost] = useState(false);

  useEffect(() => {
    const ourRequest = axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        if (response.data) {
          console.log(response.data);
          setPost(response.data);
          setIsLoading(false);
          console.log("Post " + post);
          if (appState.user.username) {
            if (response.data.author.username == appState.user.username) {
              setAuthorPost(true);
            }
          }
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  if (notFound) {
    return <NotFound />;
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );

  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  async function deleteHandler() {
    const confirmTxt = window.confirm("Do you really want to delete this post?");
    if (confirmTxt) {
      try {
        const response = await axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
        if (response.data == "Success") {
          //display a flash message
          appDispatch({ type: "flashMessage", value: "Post was succesfully deleted!" });
          //redirect to users profile
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("There was a problem");
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {authorPost && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              {" "}
              <i className="fas fa-edit"></i>
            </Link>
            <ReactToolTip id="edit" className="custom-tooltip" />
            <a onClick={deleteHandler} to={`/post/${post._id}/delete`} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
            <ReactToolTip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body}></ReactMarkdown>
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
