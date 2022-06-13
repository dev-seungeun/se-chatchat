import React, { useState, useHistory, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { logout } from "../helpers/auth";
import { authService, database, database_ref, storage, storage_ref, upload_byte, down_url } from "../services/firebase";
import { sendChat, sendChatTime, getChats, getAddedChats, offRef, getCommonInfo, setCommonInfo } from "../helpers/database";
import { useNotification } from "../helpers/useNotification";
import "../chat.css";

function useQuery() {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  return query;
}

function Chat() {

  let storageUrl = "gs://sesh-chatchat.appspot.com/";
  let isMount = true;
  let startAdd = false;
  let chatTemp = [];
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState("");
  const [chatList, setChatList] = useState("");
  const [themeInfo, setThemeInfo] = useState({theme:"", themeTxt:""});
  const [src, setSrc] = useState("");
  const [imgFile, setImgFile] = useState();

  const setChatUI = (dbChatList, isInitEnd, isClean) => {

    if(isClean) {
      $("#chatUL").empty();
    }

    var list = "";
    dbChatList.forEach((chat) => {
      var themeData = getThemeData();
      var message = (chat.message+"");
      if((themeData && themeData.theme == "dark") || (themeInfo && themeInfo.theme == "dark")) {

        list = '<li '
        list += chat.uid === authService.currentUser.uid ? 'right>' : 'left>';
        list += '<div class = "sender"><span>C:\\Users\\'+chat.email+'</span></div>';
        list += '<div class = "time"><span>'+toDate(chat.timestamp)+' ></span></div>';
        list += '<div class = "message">';

        if(message.includes("image_send_check")) {
          setFileUrl(message.split(":")[1]);
          list += '<img id="img_id_'+chat.message.split(":")[1]+'" src="" />';
        }else {
          message.split("\n").map( line => {
            list += '<span>'+line+'<br/></span>';
          });
        }
        list += '</div></li>';

      }else {

        list = '<li '
        list += chat.uid === authService.currentUser.uid ? 'class="right">' : 'class="left">';
        list += '<div class = "time"><span>'+toDate(chat.timestamp)+'</span></div>';
        list += '<div class = "sender"><span>'+chat.email+'</span></div>';
        list += '<div class = "message">';

        if(message.includes("image_send_check")) {
          setFileUrl(message.split(":")[1]);
          list += '<img id="img_id_'+chat.message.split(":")[1]+'" src="" />';
        }else {
          message.split("\n").map( line => {
            list += '<span>'+line+'<br/></span>';
          });
        }

        list += '</div></li>';

      }

      $("#chatUL").append(list);
      chatTemp.push(chat);

      const focused = document.hasFocus();
      console.log(focused);
      console.log(startAdd);
      console.log(isMount);
      if(!focused && startAdd && isMount) {
        notify(chat);
      }

    })

    setChatList(chatTemp);

    // const focused = document.hasFocus();
    // if(!focused && startAdd && isMount) {
    //   notify(chatList);
    // }
    if(isInitEnd) startAdd = true;

    isMount && setTimeout(()=>{ scrollToBottom() }, 200);
  };

  const getThemeData = () => {
    if(isMount) {
      const chatWrap = document.querySelector(".chat_wrap")
      const theme = chatWrap.getAttribute("data-theme");
      return {'chatWrap': chatWrap, 'theme': theme};
    }
  };

  const notify = (chat) => {
    // if(chatList.length > 0) {
      // const chat = chatList[chatList.length-1];
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
    // }
  }

  var checkImgCnt = 0;
  var checkImgRstCnt = 0;
  const setFileUrl = (fileName) => {
    checkImgCnt = checkImgCnt + 1;
    LoadingWithMask();
    const id = "img_id_"+fileName;
    const storageRef = down_url(storage_ref(storage, getToday()+"/"+roomName+"/images/"+fileName))
      .then((url) => {
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = (event) => {
            const blob = xhr.response;
          };
          xhr.open('GET', url);
          xhr.send();
          document.getElementById(id).src = url;

          checkImgRstCnt = checkImgRstCnt + 1;
          if(checkImgCnt == checkImgRstCnt) {
            setTimeout(closeLoadingWithMask, 2000);
          }

        })
        .catch((error) => {
        });
  }

  const getToday = () => {
    const date = new Date();
    const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
    return today;
  }

  const sendMsg = async (e, msg) => {
    if(src != "" && !src.includes("DONE")) {
      try {
        console.log("sendIMG!!!");
        LoadingWithMask();
        const self = this;
        const fileName = Date.now()+"_"+Math.floor(Math.random() * 100)+".png";
        const storageRef = storage_ref(storage, getToday()+"/"+roomName+"/images/"+fileName);
        upload_byte(storageRef, imgFile)
          .then(
            (snapshot) => {
              setSrc("DONE-"+fileName);
            },
            (error) => {
              console.log(error);
            }
          );
      } catch (error) {
        console.log(error);
      }
    }

    if(msg.trim() !== "") {
      try {
        console.log("sendMSG!!!");
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
        if(msg.includes("image_send_check:")) {
          closeLoadingWithMask();
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  const escFunction = useCallback((event) => {
    if(event.keyCode === 27) {
      setSrc("");
      document.getElementById("input-image").style.display = "none";
    }
  }, []);


// USE EFFECT  ---------------------------------------
  useEffect(() => {

    const themeInfoTmp = getCommonInfo("themeInfo");
    setThemeInfo({theme:themeInfoTmp.theme, themeTxt:themeInfoTmp.themeTxt});
    getAddedChats(roomName, setChatUI);
    document.addEventListener("keydown", escFunction, false);

    return() => {
      isMount = false;
      document.removeEventListener("keydown", escFunction, false);
    }
  }, []);

  useEffect(() => {
    if(src.includes("DONE")) {
      setSrc("");
      document.getElementById("input-image").style.display = "none";

      const fileName = src.split("-")[1];
      sendMsg(null, "image_send_check:"+fileName);

      // closeLoadingWithMask();
    }
  }, [src]);

  // useEffect(() => {
  //   // 이미지 전송 체크 msg 전송
  //   sendChat(roomName,
  //   {
  //     uid: authService.currentUser.uid,
  //     email: authService.currentUser.email,
  //     message: "image_send_check:"+fileName,
  //     timestamp: Date.now()
  //   }).then(() => {
  //   });
  //
  //   sendChatTime(roomName, authService.currentUser.uid);
  //
  //   return() => {
  //   }
  // }, [uploadState]);

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
    setChatUI(chatList, false, true);
  }

  const handleOnPaste = (e) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    let blob = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }

    if (blob !== null) {
      const reader = new FileReader();
      reader.onload = function (event) {
        setSrc(event.target.result);
        document.getElementById("input-image").style.display = "block";
      };
      reader.readAsDataURL(blob);

      var file = new File([blob], Date.now()+Math.floor(Math.random()*100));
      setImgFile(file);
    }
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

  const LoadingWithMask = () => {    
    document.getElementById("loadingMask").style.display = "block";  
    document.getElementById("loadingImg").style.display = "block";
  };

  const closeLoadingWithMask = () => {    
    document.getElementById('loadingMask').style.display = "none";
    document.getElementById('loadingImg').style.display = "none";
  };

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
      <div id="chat" className="chat">
        <ul id="chatUL"></ul>
        <div ref={messageRef} />
        <img id="input-image"
             className="input-image"
             src={src} />
      </div>
      <div className="input-div" onKeyPress={handleKeyPress}>
        <textarea
          className="input-msg"
          value={msg}
          placeholder="Message Here."
          onChange={handleOnChange}
          onPaste={handleOnPaste}
        >
        </textarea>
        <button
          className="send"
          type="button"
          onClick={handleSendMsg}>
          SEND
        </button>
      </div>

      // loading
      <div id="loadingMask">
        <img id="loadingImg" src={process.env.PUBLIC_URL+'/loader.gif'} />
      </div>

    </div>

  );
}

export default Chat;
