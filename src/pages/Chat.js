import React, { useState, useHistory, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { _commonGetCommonInfo, _commonSetCommonInfo, _commonHandleUserTheme } from "../helpers/common";
import { _authLogout, _authGetCurrentUser } from "../helpers/auth";
import { _storageSendImg, _storageDownloadImg } from "../helpers/storage";
import { _databaseSendChat, _databaseUpdateChatTime, _databaseGetAddedChats, _databaseUpdateUserProfile } from "../helpers/database";
import { _sendNotification } from "../helpers/useNotification";
import ChatItem from "../components/ChatItem"
import "../chat.css";

function Chat() {

  let isMount = true;
  let chatTemp = [];
  let navigate = useNavigate();
  const messageRef = useRef();
  const roomName = useParams().roomName;
  const [showScreen, setShowScreen] = useState(false);
  const [themeInfo, setThemeInfo] = useState({});
  const [msg, setMsg] = useState("");
  const [chatList, setChatList] = useState([]);
  const [src, setSrc] = useState("");
  const [imgFile, setImgFile] = useState();

  const setChatUI = (dbChatObj, isInitEnd, isClean) => {

    chatTemp = chatTemp.concat(dbChatObj);
    setChatList(chatTemp);

    const focused = document.hasFocus();
    if(!focused && isMount) {
      notify(dbChatObj);
    }

    isMount && scrollToBottom(0);

  };

  const notify = (chat) => {
    if(chat.uid !== _authGetCurrentUser().uid) {
      console.log("NOTI > from this room > "+chat.email);
      const res = _sendNotification("SESH", {
        body: chat.email,
        roomName : roomName
      }, function(enterRoomName){
      });
    }
  }

  const sendData = (msg, imgUrl) => {
    if(msg && msg.trim() !== "") {
      sendMsg(msg, imgUrl != undefined ? imgUrl : "")
    }else if(src != "") {
      sendImg();
    }
  }

  const sendMsg = async (msg, imgUrl) => {
    try {

      await _databaseSendChat(roomName,
      {
        uid: _authGetCurrentUser().uid,
        email: _authGetCurrentUser().email,
        message: msg,
        imgUrl: imgUrl,
        timestamp: Date.now()
      }).then(() => {
        setMsg("");
      });

      _databaseUpdateChatTime(roomName, _authGetCurrentUser());

    } catch (error) {
      console.log(error);
    }
  }

  const sendImg = () => {
    try {
      LoadingWithMask();
      _storageSendImg(roomName, imgFile, function(fileName) {
        if(fileName != undefined) {
          document.getElementById("input-image").style.display = "none";
          sendData("image_send_check:"+fileName, src);
          setSrc("");
        }else {
          alert("Upload Failed")
        }
        closeLoadingWithMask();
      })
    } catch (error) {
      console.log(error);
    }
  }

/* <IMAGE DOWNLOAD>

  var checkImgCnt = 0;
  var checkImgRstCnt = 0;
  const downloadImage = (fileName) => {
    checkImgCnt = checkImgCnt + 1;
    if(checkImgCnt != checkImgRstCnt) {
      LoadingWithMask();
    }
    const id = "img_id_"+fileName;
    console.log(id);
    console.log(document.getElementById(id));
    _storageDownloadImg(roomName, fileName, function(url) {
      if(url != undefined) {
        var downloadingImage = new Image();
        downloadingImage.src = url;
        downloadingImage.onload = function(){
          checkImgRstCnt = checkImgRstCnt + 1;
          document.getElementById(id).src = this.src;
          document.getElementById(id).style.display = "block";
          if(checkImgCnt == checkImgRstCnt) {
            closeLoadingWithMask();
            scrollToBottom();
          }
        };
      }else {
        closeLoadingWithMask();
        alert("Download Failed")
      }
    }
    })
*/


// USE_EFFECT & USE_CALLBACK ---------------------------------------
  useEffect(() => {
    handleTheme(null, true, function() {
      _databaseGetAddedChats(roomName, setChatUI);
      document.addEventListener("keydown", escFunction, false);
      setShowScreen(true);
    });

    return() => {
      isMount = false;
      document.removeEventListener("keydown", escFunction, false);
    }
  }, [roomName]);

  useEffect(() => {
    scrollToBottom(0);
  }, [showScreen]);

  const escFunction = useCallback((event) => {
    if(event.keyCode === 27) {
      setSrc("");
      document.getElementById("input-image").style.display = "none";
    }
  }, []);


// HANDLE  -------------------------------------------
  const handleSendMsg = async (e) => {
    sendData(msg);
  };

  const handleLogOut = async () => {
    try {
      await _authLogout();
    } catch (error) {
     console.log(error);
    }
  };

  const handleOnChange = (e) => {
    setMsg(e.target.value);
  };

  const handleKeyPress = async(e) => {
    if(e.key == "Enter") {
      if(!e.shiftKey) {
        sendData(msg);
      }
    }
  }

  const handleTheme = (e, isInit, callback) => {
    !isInit && _databaseUpdateUserProfile("theme", themeInfo.theme == "dark" ? "light" : "dark", _authGetCurrentUser());
    _commonHandleUserTheme(function(userThemeObj) {
      setThemeInfo(userThemeObj);
      scrollToBottom(0);
      callback && callback();
    })
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

  const handleChangeFile = (e) => {
    for(var i=0;i<e.target.files.length;i++){
      if (e.target.files[i]) {
        let reader = new FileReader();
        reader.readAsDataURL(e.target.files[i]);
        reader.onloadend = () => {
          const base64 = reader.result;
          if (base64) {
            var base64Str = base64.toString()
            setSrc(base64Str);
            document.getElementById("input-image").style.display = "block";

           // Base64 to File
            var arr = base64Str.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }

            var file = new File([u8arr], Date.now()+Math.floor(Math.random()*100));
            setImgFile(file);
            document.getElementById("textarea").focus();
          }
        }
      }
    }
  }

// ETC ----------------------------------------------
  const scrollToBottom = (msTime) => {
    if(!messageRef.current) return;
    setTimeout(() => {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }, msTime);
  }

  const getToday = () => {
    const date = new Date();
    const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
    return today;
  }

  const LoadingWithMask = () => {    
    document.getElementById("loadingMask").style.display = "block";  
  };

  const closeLoadingWithMask = () => {    
    document.getElementById("loadingMask").style.display = "none";
  };

  const openImageModal = (e) => {
    document.getElementById("modal").style.display = "block";
    let imgSrc;

    if(themeInfo.theme == "light") {
      imgSrc = document.getElementById(e.currentTarget.id).src;
    }else {
      imgSrc = document.getElementById(e.currentTarget.id).firstChild.innerHTML;
    }
    document.getElementById("modalBoxImg").src = imgSrc;
  };

  const closeImageModal = (e) => {
    document.getElementById("modal").style.display = "none";
  };
// --------------------------------------------------

  return (
    showScreen &&
    <div className="chat_wrap" data-theme={themeInfo.theme}>
      <div className="header">
        <button
          className="mode"
          type="button"
          id="modeBtn"
          onClick={handleTheme}>
          {themeInfo.themeBtnValue}
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
        <ul>
          {chatList.map((chat, index) => {
              return <ChatItem theme={themeInfo.theme}
                               chat={chat}
                               openImageModal={openImageModal}
                               key={index} />
          })}
        </ul>
        <div ref={messageRef} />
        <img id="input-image"
             className="input-image"
             src={src} />
      </div>
      <div className="input-div" onKeyPress={handleKeyPress}>
        <textarea
          id="textarea"
          className="input-msg"
          value={msg}
          placeholder="Message Here."
          onChange={handleOnChange}
          onPaste={handleOnPaste}
        >
        </textarea>
        <div id="image_upload">
          <label htmlFor="file_input">
            <img src="file_input.png" />
            <span>FILE</span>
          </label>
          <input id="file_input" type="file" accept="image/*" onChange={handleChangeFile} />
        </div>
        <button
          className="send"
          type="button"
          onClick={handleSendMsg}>
          SEND
        </button>
      </div>

      // loading
      <div id="loadingMask">
        <div></div>
        <img id="loadingImg" src={process.env.PUBLIC_URL+"/loader.gif"} />
      </div>

    	<div id="modal" className="modal" onClick={closeImageModal}>
    		<button onClick={closeImageModal}>&times;</button>
    		<div id="modalBox" className="modalBox">
    			<img id="modalBoxImg" src="" />
    		</div>
    	</div>
    </div>
  );

}

export default Chat;
