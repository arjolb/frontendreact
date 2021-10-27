import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function HeaderLoggedIn(props) {
  // const { setLoggedIn } = useContext(ExampleContext);
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleLogout() {
    // setLoggedIn(false);
    appDispatch({ type: "logout" });
    appDispatch({ type: "flashMessage", value: "You have successfully logged out" });
  }

  function handleSearch(e) {
    e.preventDefault();
    appDispatch({ type: "openSearch" });
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a onClick={handleSearch} data-for="search" data-tip="Search" href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />{" "}
      <span
        onClick={() => {
          appDispatch({ type: "chatToggle" });
        }}
        data-for="chat"
        data-tip="Chat"
        className={"mr-2 header-chat-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")}
      >
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? <span className="chat-count-badge text-white">{appState.unreadChatCount > 9 ? "9+" : appState.unreadChatCount}</span> : ""}
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />{" "}
      <Link to={`/profile/${appState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
