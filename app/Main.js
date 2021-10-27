import React, { useState, useReducer, useEffect, Suspense } from "react";
import ReactDom from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
// Axios.defaults.baseURL = "http://localhost:8080";
Axios.defaults.baseURL = process.env.BACKENDURL || "https://backendtestreact.herokuapp.com";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import { CSSTransition } from "react-transition-group";

// my components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
// const CreatePost = React.lazy(() => import("./components/CreatePost"));
import ViewSinglePost from "./components/ViewSinglePost";
// const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";
import Chat from "./components/Chat";
import LoadingIcon from "./components/LoadingIcon";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexAppUsername"),
      avatar: localStorage.getItem("complexAppAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  //Use Reducer
  // function ourReducer(state, action) {
  //   switch (action.type) {
  //     case "login":
  //       return { loggedIn: true, flashMessages: state.flashMessages };
  //     case "logout":
  //       return { loggedIn: false, flashMessages: state.flashMessages };
  //     case "flashMessage":
  //       return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) };
  //   }
  // }
  // const [state, dispatch] = useReducer(ourReducer, initialState);

  //UseImmerReducer
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "openSearch":
        draft.isSearchOpen = true;
        return;
      case "closeSearch":
        draft.isSearchOpen = false;
        return;
      case "chatToggle":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexAppToken", state.user.token);
      localStorage.setItem("complexAppUsername", state.user.username);
      localStorage.setItem("complexAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexAppToken");
      localStorage.removeItem("complexAppUsername");
      localStorage.removeItem("complexAppAvatar");
    }
  }, [state.loggedIn]);

  //Check if token is expired on the first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token });
          console.log(response.data);
          //token is no longer valid
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your token has expired. Please log in again." });
          }
        } catch (e) {
          console.log("There was a problem fetching posts!");
        }
      }
      fetchResults();

      return () => ourRequest.cancel();
    }
  }, []);

  /* WITHOUT REDUCER */
  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexAppToken")));
  // const [flashMessages, setFlashMessages] = useState([]);

  // function addFlashMessage(msg) {
  //   setFlashMessages((prev) => prev.concat(msg));
  // }

  return (
    //<ExampleContext.Provider value={{ addFlashMessage, setLoggedIn }}>
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          {/* <Header loggedIn={loggedIn} /> */}
          <Header />
          <Suspense fallback={<LoadingIcon />}>
            <Switch>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDom.render(<Main />, document.querySelector("#app"));
