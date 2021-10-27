import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
      firstLetterNumber: false
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameTyping":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        draft.username.firstLetterNumber = false;

        if (draft.username.value && draft.username.value.length > 3 && draft.username.value[0].match(/\d/)) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot start with a number.";
          draft.username.firstLetterNumber = true;
        }
        if (draft.username.value.length > 30 && !draft.username.firstLetterNumber) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot exceed 30 characters.";
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "Username can only contain letters and numbers.";
        }
        return;
      case "usernameAfterDelay":
        // draft.username.hasErrors = false;
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 characters.";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case "usernameUnique":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "That username is already taken.";
        } else {
          draft.username.isUnique = true;
        }
        return;

      //email
      case "emailTyping":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        return;
      case "emailAfterDelay":
        // draft.email.hasErrors = false;
        if (!/^([a-zA-Z]+)([a-zA-Z0-9_]+)?([a-zA-Z0-9]+)?(@)([a-z]+)(\.)([a-z]{2,3})$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case "emailUnique":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "That email is already being used";
        } else {
          draft.email.isUnique = true;
        }
        return;

      //password
      case "passwordTyping":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters";
        }
        return;

      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 12 characters";
        }
        return;

      //submit
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++;
        }
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //Check if username is greater than 3 characters
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "usernameAfterDelay" });
      }, 850);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  //Check if email with regex
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "emailAfterDelay" });
      }, 850);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  //Check if password is greater than 12 characters
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "passwordAfterDelay" });
      }, 850);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  //axios request - username check
  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token });
          console.log(response.data);
          dispatch({ type: "usernameUnique", value: response.data });
        } catch (e) {
          console.log("There was a problem fetching posts!");
        }
      }
      fetchResults();

      return () => ourRequest.cancel();
    }
  }, [state.username.checkCount]);

  //axios request - username check
  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token });
          console.log(response.data);
          dispatch({ type: "emailUnique", value: response.data });
        } catch (e) {
          console.log("There was a problem fetching posts!");
        }
      }
      fetchResults();

      return () => ourRequest.cancel();
    }
  }, [state.email.checkCount]);

  //axios request - submit
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token });
          console.log(response.data);
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMessage", value: "Welcome to your account!" });
        } catch (e) {
          console.log("There was a problem fetching posts!");
        }
      }
      fetchResults();

      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "usernameTyping", value: state.username.value });
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailTyping", value: state.email.value });
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordTyping", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={(e) => {
                  dispatch({ type: "usernameTyping", value: e.target.value });
                }}
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={(e) => dispatch({ type: "emailTyping", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={(e) => dispatch({ type: "passwordTyping", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
