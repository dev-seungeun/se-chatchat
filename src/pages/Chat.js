import React, { useState, useHistory, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../helpers/auth";
import { authService, database, database_ref } from "../services/firebase";
import { sendChat, sendChatTime, getChats, getAddedChats, offRef, getCommonInfo, setCommonInfo } from "../helpers/database";
import { useNotification } from "../helpers/useNotification";
import "../chat.css";

function useQuery() {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  return query;
}

function Chat() {

  let isMount = true;
  let startAdd = false;
  const [msg, setMsg] = useState("");
  const [chatList, setChatList] = useState("");
  const [chats, setChats] = useState("");
  const [themeInfo, setThemeInfo] = useState({theme:"", themeTxt:""});

  const setChatUI = (chatList, isInitEnd) => {
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
    setChatList(chatList);

    const focused = document.hasFocus();
    if(!focused && startAdd && isMount) {
      notify(chatList);
    }
    if(isInitEnd) startAdd = true;

    isMount && setTimeout(()=>{ scrollToBottom() }, 200);

  };

  const getThemeData = () => {
    if(isMount) {
      const chatWrap = document.querySelector(".chat_wrap")
      const theme = chatWrap.getAttribute("data-theme");
      console.log(theme)
      return {'chatWrap': chatWrap, 'theme': theme};
    }
  };

  const notify = (chatList) => {
    if(chatList.length > 0) {
      const chat = chatList[chatList.length-1];
      if(chat.uid !== authService.currentUser.uid) {
        console.log("NOTI > from chat")
        const res = useNotification('SESH', {
          body: "from '"+roomName+"'"
        });
        console.log(res);
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
          message: msg,
          timestamp: Date.now()
        }).then(() => {
          setMsg("");
        });

        sendChatTime(roomName, authService.currentUser.uid);

      } catch (error) {
        console.log(error);
      }
    }
  }

// USE EFFECT  ---------------------------------------
  useEffect(() => {
    const themeInfoTmp = getCommonInfo("themeInfo");
    setThemeInfo({theme:themeInfoTmp.theme, themeTxt:themeInfoTmp.themeTxt});
    getAddedChats(roomName, setChatUI);
    return() => {
      isMount = false;
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


  const handleTheme = (e) => {
    const modeBtn = document.getElementById("modeBtn");
    const themeData = getThemeData();
    const chatWrap = themeData.chatWrap;
    const theme = themeData.theme;
    if(theme == "light") {
      chatWrap.removeAttribute("data-theme", "light")
      chatWrap.setAttribute("data-theme", "dark")
      modeBtn.innerText = "LIGHT"
      setCommonInfo("themeInfo", {theme:"dark", themeTxt:"LIGHT"})
    }else {
      chatWrap.removeAttribute("data-theme", "dark")
      chatWrap.setAttribute("data-theme", "light")
      modeBtn.innerText = "DARK"
      setCommonInfo("themeInfo", {theme:"light", themeTxt:"DARK"})
    }
    setChatUI(chatList);
  }


// ETC ----------------------------------------------
  let query = useQuery();
  const roomName = query.get("room");

  const messageRef = useRef();
  const scrollToBottom = () => {
    messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
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

    <div className="chat_wrap" data-theme={themeInfo.theme}>
      <div className="header">
        <button
          className="mode"
          type="button"
          id="modeBtn"
          value=""
          onClick={handleTheme}>
          {themeInfo.themeTxt}
        </button>
        <div className="title">{roomName}</div>
        <button
          className="logout"
          type="button"
          onClick={handleLogOut}>
          LOGOUT
        </button>
      </div>
      <div className="chat">
        {chats}
        <div ref={messageRef} />
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
