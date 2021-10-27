import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { withRouter } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { useImmerReducer } from "use-immer";

function CreatePost(props) {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isSaving: false,
    sendCount: 0,
    notFound: false
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "titleChange":
        draft.title.value = action.value;
        if (draft.title.value.trim().length > 0) {
          draft.title.hasErrors = false;
        }
        return;
      case "bodyChange":
        draft.body.value = action.value;
        if (draft.body.value.trim().length > 0) {
          draft.body.hasErrors = false;
        }
        return;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title";
        }
        return;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You must provide body content";
        }
        return;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  async function handleSubmit(e) {
    e.preventDefault();

    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "submitRequest" });
  }

  useEffect(() => {
    if (state.sendCount) {
      async function createPost() {
        try {
          const response = await axios.post("/create-post", {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token
          });
          //Redirect to new post url
          // addFlashMessage("Congrats, the post was created successfully!!!");
          appDispatch({ type: "flashMessage", value: "Congrats, you created a new post!!!" });
          props.history.push(`/post/${response.data}`);

          //   console.log(response);
          //   console.log("Post was created!");
        } catch (e) {
          console.log("There was a problem.", e);
        }
      }
      createPost();
    }
  }, [state.sendCount]);

  return (
    <Page title="Create Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={(e) => dispatch({ type: "titleChange", value: e.target.value })} onBlur={(e) => dispatch({ type: "titleRules", value: e.target.value })} name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage create-post">{state.title.message} </div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={(e) => dispatch({ type: "bodyChange", value: e.target.value })} onBlur={(e) => dispatch({ type: "bodyRules", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage create-post">{state.body.message} </div>}
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
