import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../helpers/auth";
import { authService, database, database_ref } from "../services/firebase";
import { sendChat, getChats, chatOnValue, chatOnChildAdded, chatOnChildChanged, chatOnChildRemoved } from "../helpers/database";
import "../chat.css";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Chat() {

  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState("");

  let query = useQuery();
  const roomName = query.get("room")

  const scrollRef = useRef();
  const scrollToBottom = () => {
    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  let itemId = 1;
  const createItem = (text) => {
    return (itemId++) + text;
  }

  const toDate = (timestamp) => {
    let date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
    return date;
  }
  const getChatList = () => {
    const chatList = getChats(roomName);
    const myList = () => {
      const list = chatList.map((chat, index) => (
        <li key={createItem(index+"li")} className={chat.uid === authService.currentUser.uid ? "right" : "left"}>
          <div key={createItem(index+"time")} className = "time"><span>{toDate(chat.timestamp)}</span></div>
          <div key={createItem(index+"sender")} className = "sender"><span>{chat.email}</span></div>
          <div key={createItem(index+"message")} className = "message">
            {chat.message.split('\n').map( line => {
              return (<span key={createItem(index+"span")}>{line}<br/></span>)
             })}
          </div>
        </li>
      ));
      return <ul>{list}</ul>;
    };
    setChats(myList);
  };

  const handleOnChange = (e) => {
  	setMsg(e.target.value);
  };

  const onKeyPress = async(e) => {
    if(e.key == 'Enter') {
      if(!e.shiftKey) {
        if(msg.trim() !== "") {
          e.preventDefault();
          try {
            await sendChat(roomName,
            {
              uid: authService.currentUser.uid,
              email: authService.currentUser.email,
              // message: msg.replaceAll(/(\n|\r\n)/g, "<br>"),
              message: msg,
              timestamp: Date.now()
            }).then(() => {
              setMsg("");
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }
  const handleGoogleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
     console.log(error);
    }
  };

  useEffect(() => {
    try {
      //chatOnChildChanged
      const commentsRef = database_ref(database, 'chats/'+roomName);
      chatOnChildAdded(commentsRef, (data) => {
        getChatList();
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="chat_wrap" ref={scrollRef}>
      <div className="header">
        <div className="title">SE-SH</div>
        <button
          className="logout"
          type="button"
          onClick={handleGoogleLogOut}>
          LOGOUT
        </button>
      </div>
      <div className="chat">
        {chats}
      </div>
      <div className="input-div" onKeyPress={onKeyPress}>
        <textarea
          className="input-msg"
          value={msg}
          placeholder="Message Here."
          onChange={handleOnChange}>
        </textarea>
      </div>
    </div>

  );
}

export default Chat;
