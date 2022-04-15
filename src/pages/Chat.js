import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../helpers/auth";
import { authService, database, database_ref } from "../services/firebase";
import { sendChat, getChats, getAddedChats } from "../helpers/database";
import useNotification from "../helpers/useNotification";
import "../chat.css";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Chat() {

  let startAdd = false;
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState("");

  const setChatList = (chatList, isInitEnd) => {
    const themeData = getThemeData();
    const myList = () => {
      if(themeData.theme == "light") {
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
      }else {
        const list = chatList.map((chat, index) => (
          <li key={createItem(index+"li")} className={chat.uid === authService.currentUser.uid ? "right" : "left"}>
            <div key={createItem(index+"sender")} className = "sender"><span>{"C:\\Users\\"+chat.email}</span></div>
            <div key={createItem(index+"time")} className = "time"><span>{toDate(chat.timestamp)+" >"}</span></div>
            <div key={createItem(index+"message")} className = "message">
              {chat.message.split('\n').map( line => {
                return (<span key={createItem(index+"span")}>{line}<br/></span>)
               })}
            </div>
          </li>
        ));
        return <ul>{list}</ul>;
      }
    }
    setChats(myList);

    const focused = document.hasFocus();
    if(!focused && startAdd) {
      notify(chatList);
    }
    if(isInitEnd) startAdd = true;

    setTimeout(()=>{ scrollToBottom() }, 200);

  };

  const getThemeData = () => {
    const chatWrap = document.querySelector(".chat_wrap")
    const theme = chatWrap.getAttribute("user-theme");
    return {'chatWrap': chatWrap, 'theme': theme};
  };

  const notify = (chatList) => {
    if(chatList.length > 0) {
      const chat = chatList[chatList.length-1];
      if(chat.uid !== authService.currentUser.uid) {
        useNotification('SESH', {
          body: ''
        });
        // useNotification(chat.email, {
        //   body: `${chat.message}`
        // });
      }
    }
  }

  const sendMsg = async (e, msg) => {
    if(msg.trim() !== "") {
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
          scrollToBottom();
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

// USE EFFECT  ---------------------------------------
  useEffect(() => {
    try {
      getAddedChats(roomName, setChatList);
    } catch (error) {
      console.log(error);
    }
  }, []);


// HANDLE  -------------------------------------------
  const handleSendMsg = async (e) => {
    sendMsg(e, msg);
  };

  const handleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
     console.log(error);
    }
  };

  const handleOnChange = (e) => {
    setMsg(e.target.value);
  };


  const handleKeyPress = async(e) => {
    if(e.key == 'Enter') {
      if(!e.shiftKey) {
        sendMsg(e, msg);
      }
    }
  }


  const handleModal = async(e) => {
    const modeBtn = document.getElementById("modeBtn");
    const themeData = getThemeData();
    const chatWrap = themeData.chatWrap;
    const theme = themeData.theme;
    if(theme == "light") {
      chatWrap.setAttribute("user-theme", "dark")
      modeBtn.innerText = "LIGHT"
    }else {
      chatWrap.setAttribute("user-theme", "light")
      modeBtn.innerText = "DARK"
    }
    getAddedChats(roomName, setChatList);
  }


// ETC ----------------------------------------------
  let query = useQuery();
  const roomName = query.get("room")

  const scrollRef = useRef();
  const scrollToBottom = () => {
    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
  }

  let itemId = 1;
  const createItem = (text) => {
    return (itemId++) + text;
  }

  const toDate = (timestamp) => {
    //let date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
    let date = new Intl.DateTimeFormat('ko-KR', {  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(timestamp);
    return date;
  }
// --------------------------------------------------

  return (

    <div className="chat_wrap" ref={scrollRef} user-theme="light">
      <div className="header">
        <button
          className="mode"
          type="button"
          id="modeBtn"
          value=""
          onClick={handleModal}>
          DARK
        </button>
        <div className="title">SESH</div>
        <button
          className="logout"
          type="button"
          onClick={handleLogOut}>
          LOGOUT
        </button>
      </div>
      <div className="chat">
        {chats}
      </div>
      <div className="input-div" onKeyPress={handleKeyPress}>
        <textarea
          className="input-msg"
          value={msg}
          placeholder="Message Here."
          onChange={handleOnChange}>
        </textarea>
        <button
          className="send"
          type="button"
          onClick={handleSendMsg}>
          SEND
        </button>
      </div>
    </div>

  );
}

export default Chat;
