import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useImmer } from "use-immer";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
const socket = io(process.env.BACKENDURL || "https://backendtestreact.herokuapp.com");

function Chat() {
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  });

  //focus input and clear unread messages
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearUnreadChatCount" });
    }
  }, [appState.isChatOpen]);

  //receive message from server
  useEffect(() => {
    socket.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
  }, []);

  //scroll to end of chat container and icrement unread messages
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.chatMessages]);

  function handleInput(e) {
    const value = e.target.value;
    setState((draft) => {
      draft.fieldValue = value;
      console.log(draft.fieldValue);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log(state.fieldValue);
    //Send message to chat server
    socket.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token });

    setState((draft) => {
      //Add message to state collection of messages
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar });
      draft.fieldValue = "";
    });
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          className="chat-title-bar-close"
          onClick={() => {
            appDispatch({ type: "closeChat" });
          }}
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }

          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}</strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} onChange={handleInput} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoFocus autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
