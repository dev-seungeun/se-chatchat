import React, { useState, useHistory, useEffect, useRef, useCallback, useLocation } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { _commonGetCommonInfo, _commonSetCommonInfo, _commonHandleUserTheme } from "../helpers/common";
import { _authLogout, _authGetCurrentUser } from "../helpers/auth";
import { _storageSendImg, _storageDownloadImg } from "../helpers/storage";
import { _databaseGetRoomAuth, _databaseSendChat, _databaseUpdateChatTime, _databaseGetAddedChats, _databaseGetCountChats, _databaseUpdateUserProfile } from "../helpers/database";
import { _sendNotification } from "../helpers/useNotification";
import ChatItem from "../components/ChatItem"
import "../chat.css";

function Chat() {

  let isMount = true;
  let notifyStart = true;
  let chatTemp = [];
  let navigate = useNavigate();
  const messageRef = useRef();
  const roomName = useParams().roomName;
  const [showScreen, setShowScreen] = useState(false);
  const [themeInfo, setThemeInfo] = useState({});
  const [reply, setReply] = useState(null);
  const [replyInfo, setReplyInfo] = useState(null);
  const [backId, setBackId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [src, setSrc] = useState("");
  const [imgFile, setImgFile] = useState();

  const setChatUI = (dbChatObj) => {

    chatTemp = chatTemp.concat(dbChatObj);
    setChatList(chatTemp);

    const focused = document.hasFocus();
    if(!focused && isMount && notifyStart) {
      notify(dbChatObj);
    }

    isMount && scrollToBottom(0);

  }

  const notify = (chat) => {
    if(chat.uid !== _authGetCurrentUser().uid) {
      console.log("NOTI > from this room > "+chat.email);
      const res = _sendNotification("SESH", {
        body: chat.email,
        roomName : roomName
      });
    }
  }

  const sendData = () => {
    var msgTxt = document.getElementById("textarea").value;
    if(msgTxt && msgTxt.trim() !== "") {
      sendMsg(msgTxt, "");
    }
    if(src != "") {
      sendImg();
    }
  }

  const sendMsg = async (message, imgUrl) => {
    try {

      await _databaseSendChat(roomName,
      {
        uid: _authGetCurrentUser().uid,
        email: _authGetCurrentUser().email,
        message: message,
        imgUrl: imgUrl,
        timestamp: Date.now(),
        reply: reply ? reply : null
      }).then(() => {
        if(imgUrl == "") {
          document.getElementById("textarea").value = "";
          setReply(null);
          setReplyInfo(null);
        }
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
          sendMsg("image_send_check:"+fileName, src);
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
    _databaseGetRoomAuth(roomName, function(roomAuth) {
      if(roomAuth == null) {
        alert("'"+roomName+"'방이 존재하지 않습니다.");
        navigate("/room");
      }else if(!Object.keys(roomAuth).includes(_authGetCurrentUser().uid)) {
        alert("'"+roomName+"'방에 권한이 없습니다.");
        navigate("/room");
      }
    })
    handleTheme(null, true, function() {
      _databaseGetAddedChats(roomName, setChatUI)
      .then((result) => {
        notifyStart = result;
        setShowScreen(true);
      });
      document.addEventListener("keydown", escFunction, false);
    });

    return() => {
      isMount = false;
      document.removeEventListener("keydown", escFunction, false);
    }
  }, [roomName]);

  useEffect(() => {
    // console.log("reply:"+reply);
    // console.log("replyInfo:"+replyInfo);
    // console.log(backId);
  }, [replyInfo,reply,backId]);

  useEffect(() => {
    if(showScreen)  {
      scrollToBottom(0, "auto");
      setTimeout(function(){
        document.getElementById("chat_wrap").style.visibility = "visible";
      }, 10)
    }
  }, [showScreen]);

  const escFunction = useCallback((event) => {
    if(event.keyCode === 27) {
      setSrc("");
      document.getElementById("input-image").style.display = "none";
    }
  }, []);


// HANDLE  -------------------------------------------
  const handleSendMsg = async (e) => {
    sendData();
  };

  const handleLogOut = async () => {
    try {
      await _authLogout();
    } catch (error) {
     console.log(error);
    }
  };

  const handleOnChange = (e) => {
    document.getElementById("textarea").value = e.target.value;
  };

  const handleKeyPress = async(e) => {
    if(e.key == "Enter") {
      var msgTxt = document.getElementById("textarea").value;
      if(msgTxt.trim() == "" && src == ""){
        e.preventDefault();
      }else {
        if(!e.shiftKey) {
          sendData();
          e.preventDefault();
        }
      }
    }
  }

  const handleMsgRightClick = (e, chatInfo) => {
    e.preventDefault();
    setReply(chatInfo.email+"-"+chatInfo.timestamp+"-"+chatInfo.message);
    document.getElementById("rmenu").className = "right_btn_show";
    document.getElementById("rmenu").style.top = mouseY(e) + 'px';
    document.getElementById("rmenu").style.left = mouseX(e) + 'px';
  }

  const handleMsgLeftClick = (e, isX) => {
    if(!replyInfo || isX) {
      setReply(null);
      if(document.getElementById("rmenu") && document.getElementById("rmenu").className == "right_btn_hide") {
        setReplyInfo(null);
      }
    }
    if(document.getElementById("rmenu")) {
      document.getElementById("rmenu").className = "right_btn_hide";
    }
  }

  const handleRightMenu = (e) => {
    e && e.preventDefault();
    document.getElementById("rmenu").className = "right_btn_hide";
    const replyData = document.getElementById("rmenu").getAttribute("data-reply");
    const replyEmail = replyData.split("-")[0];
    const replyId = replyData.split("-")[1];
    const replyMsg = replyData.split("-")[2];
    setReplyInfo(<span className="reply-email">{replyEmail+"님에게 답장"}<br/><span className="reply-msg">{replyMsg}</span></span>);
    document.getElementById("textarea").focus();
  }

  const handleTheme = (e, isInit, callback) => {
    !isInit && _databaseUpdateUserProfile("theme", themeInfo.theme == "dark" ? "light" : "dark", _authGetCurrentUser());

    if(document.getElementById("chat_wrap")) {
      document.getElementById("chat_wrap").style.visibility = "hidden";
    }

    _commonHandleUserTheme(function(userThemeObj) {
      setThemeInfo(userThemeObj);
      handleMsgLeftClick();
      scrollToBottom(0, "auto");
      if(document.getElementById("chat_wrap")) {
        document.getElementById("chat_wrap").style.visibility = "visible";
      }
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
  const scrollToBottom = (msTime, behavior) => {
    if(!messageRef.current) return;
    setTimeout(() => {
      messageRef.current.scrollIntoView({ behavior: behavior ? behavior : "smooth", block: "end" })
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

  const goToReplyMsg = (e, id) => {
    e.preventDefault();
    if(document.getElementById(id) == null) {
      alert("대상 메시지가 지워졌습니다.");
      return;
    }else {
      var divTop = document.getElementById(id).offsetTop - (window.innerHeight/5*2.3);
      $('#chat').scrollTop(divTop);

      // 반짝반짝
      document.getElementById(id).classList.add("selected_msg");
      setTimeout(function() { document.getElementById(id).classList.remove("selected_msg"); }, 300);
      setTimeout(function() { document.getElementById(id).classList.add("selected_msg");    }, 600);
      setTimeout(function() { document.getElementById(id).classList.remove("selected_msg"); }, 900);

      setBackId(e.target.parentNode.id);
    }
  }

  const goToBackReplyMsg = (e, id) => {
    var divTop = document.getElementById(backId).offsetTop-(themeInfo.theme == "dark" ? (window.innerHeight-45) : 80);
    $('#chat').scrollTop(divTop);
    setBackId(null);
  }

  const mouseX = (e) => {
    if (e.pageX) {
      return e.pageX-20;
    } else if (e.clientX) {
      return e.clientX + (document.documentElement.scrollLeft ?
        document.documentElement.scrollLeft :
        document.body.scrollLeft);
    } else {
      return null;
    }
  }

  const mouseY = (e) => {
    if (e.pageY) {
      return e.pageY;
    } else if (e.clientY) {
      return e.clientY + (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
    } else {
      return null;
    }
  }

  const getScrollPoistion = (e) => {
    if(backId) {
      var chatScrollY = document.getElementById("chat").scrollTop;
      if(chatScrollY > (document.getElementById(backId).offsetTop-(themeInfo.theme == "dark" ? (window.innerHeight-45) : (window.innerHeight-140)))) {
        setBackId(null);
      }
    }
  }
// --------------------------------------------------

  return (
    showScreen &&
    <div id="chat_wrap" className="chat_wrap" data-theme={themeInfo.theme} style={{visibility:"hidden"}}>
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
      <div id="chat" className="chat" onClick={handleMsgLeftClick} onScroll={getScrollPoistion}>
        <ul>
          {chatList.map((chat, index) => {
              return <ChatItem theme={themeInfo.theme}
                               chat={chat}
                               openImageModal={openImageModal}
                               handleMsgRightClick={handleMsgRightClick}
                               goToReplyMsg={goToReplyMsg}
                               key={index} />
          })}
        </ul>
        <div ref={messageRef} />
        <img id="input-image"
             className="input-image"
             src={src} />
      </div>
      {replyInfo &&
      <div id="reply-info">
        {replyInfo}
        <span className="reply-x" onClick={(e)=>handleMsgLeftClick(e, true)}>X</span>
      </div>}
      <div className="input-div" onKeyPress={handleKeyPress}>
        <textarea
          id="textarea"
          className="input-msg"
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

      <div className="right_btn_hide" id="rmenu" onClick={handleRightMenu} data-reply={reply}>
        <ul>
          <li>
            답장하기
          </li>
        </ul>
      </div>

      {backId && <div id="back_reply"><span onClick={goToBackReplyMsg}>답장으로 돌아가기</span></div>}

    </div>
  );

}

export default Chat;
