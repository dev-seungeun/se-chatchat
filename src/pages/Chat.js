import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { _commonGetCommonInfo, _commonSetCommonInfo, _commonHandleUserTheme, _commonGetToday, _logger } from "../helpers/common";
import { _authLogout, _authGetCurrentUser } from "../helpers/auth";
import { _storageSendImg, _storageDownloadImg } from "../helpers/storage";
import { _databaseGetRoomAuth,  _databaseUpdateUserProfile, _databaseGetChatDayList, _databaseSendChat, _databaseUpdateChatTime, _databaseGetChatHistory, _databaseGetAddedChats, _databaseRemoveChat } from "../helpers/database";
import ChatItem from "../components/ChatItem"
import { BsThreeDotsVertical } from "react-icons/bs";
import "../style/chat.css";

function Chat() {

    var isMount = true;
    var chatTemp = [];
    const navigate = useNavigate();
    const location = useLocation();
    const messageRef = useRef();
    const roomName = useParams().roomName;
    const [themeInfo, setThemeInfo] = useState({});
    const [reply, setReply] = useState(null);
    const [replyInfo, setReplyInfo] = useState(null);
    const [backId, setBackId] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [src, setSrc] = useState("");
    const [imgFile, setImgFile] = useState();
    const [isOwner, setIsOwner] = useState(false);
    const [dateList, setDateList] = useState([]);
    const [emptyToday, setEmptyToday] = useState(false);
    const [isTodayChat, setIsTodayChat] = useState(true);
    const [childAdded, setChildAdded] = useState([]);

    const setChatUI = (dbChatObj) => {
        if(isMount) {
            chatTemp = dbChatObj == null ? [] : chatTemp.concat(dbChatObj);
            setChildAdded(chatTemp);
        }
    };

    const sendData = () => {
        _logger("sendData()");

        var msgTxt = document.getElementById("textarea").value;
        if(msgTxt && msgTxt.trim() !== "") {
            sendMsg(msgTxt, "");
        }
        if(src != "") {
            sendImg();
        }
    }

    const sendMsg = async (message, imgUrl) => {
        _logger("sendMsg()", message);

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
                    _logger("  -> _databaseSendChat return", imgUrl);

                    if(imgUrl == "") {
                        document.getElementById("textarea").value = "";
                        setReply(null);
                        setReplyInfo(null);
                    }
            });

            _logger("  -> _databaseUpdateChatTime excute");
            _databaseUpdateChatTime(roomName, _authGetCurrentUser());

        } catch (error) {
            console.log(error);
        }
    }

    const sendImg = (e) => {
        _logger("sendImg()");

        try {
            loadingWithMask(e);
            _storageSendImg(roomName, imgFile, function(fileName) {
                if(fileName != undefined) {
                    handleShowElement(e, "input-image", false);
                    sendMsg("image_send_check:"+fileName, src);
                    setSrc("");
                }else {
                    alert("Upload Failed")
                }

                closeLoadingWithMask(e);

            })
        } catch (error) {
            _logger(error);
        }
    }

    /* <IMAGE DOWNLOAD>

      var checkImgCnt = 0;
      var checkImgRstCnt = 0;
      const downloadImage = (fileName) => {
        checkImgCnt = checkImgCnt + 1;
        if(checkImgCnt != checkImgRstCnt) {
          loadingWithMask();
        }
        const id = "img_id_"+fileName;
        _logger(id);
        _logger(document.getElementById(id));
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
        _logger("useEffect() -> [roomName]");

        _databaseGetRoomAuth(roomName, function(roomAuth) {
            _logger("  -> _databaseGetRoomAuth callback", Object.keys(roomAuth));

            if(roomAuth == null) {
                alert("'"+roomName+"'방이 존재하지 않습니다.");
                navigate("/room");
            }else if(!Object.keys(roomAuth).includes(_authGetCurrentUser().uid)) {
                alert("'"+roomName+"'방에 권한이 없습니다.");
                navigate("/room");
            }else {
                if(roomAuth[_authGetCurrentUser().uid] == "owner") {
                    setIsOwner(true);
                }
                _commonSetCommonInfo("selectedRoom", roomName);
            }
        });

        handleTheme(null, true);
        document.addEventListener("keydown", keyDownFunction);
        window.onfocus = focusFunction;
        window.onblur = blurFunction;
        refreshDateList(true);

        return() => {
            _logger("useEffect() -> [roomName] -> return function");

            isMount = false;
            document.removeEventListener("keydown", keyDownFunction);
        }
    }, [roomName]);

    useEffect(() => {
        _logger("useEffect() -> [location]", location);

        if(location.state != null && location.state.hasOwnProperty("roomName") &&  location.state.roomName == roomName) {
            changeDate(null, {date: _commonGetToday()});
        }
    }, [location]);

    useEffect(() => {
        _logger("useEffect() -> [childAdded] // isTodayChat : ", isTodayChat);

        if(isTodayChat) {
            setChatList(childAdded);
            scrollToBottom(0, "auto");
        }
    }, [isTodayChat, childAdded]);

    useEffect(() => {
        _logger("useEffect() -> [chatList] // length : ", chatList.length);

        if(chatList.length > 0) {
        }
    }, [chatList]);

    useEffect(() => {
        _logger("useEffect() -> [replyInfo, reply, backId]");

        // _logger("reply:"+reply);
        // _logger("replyInfo:"+replyInfo);
        // _logger(backId);
    }, [replyInfo,reply,backId]);

    // dateList 업데이트시 오늘날짜로 채팅셋팅
    useEffect(() => {
        if(dateList.length > 0) {
            _logger("useEffect() -> [dateList]", dateList);

            if(dateList != null) {
                var today = _commonGetToday();
                _logger("  -> _databaseGetAddedChats excute");
                _databaseGetAddedChats(roomName, setChatUI)
                    .then(() => {
                        _logger("  -> _databaseGetAddedChats return : before callback");

                        _commonSetCommonInfo("chatDate", today);
                        setIsTodayChat(true);
                    });
            }
        }
    }, [dateList]);

    const keyDownFunction = useCallback((e) => {
        _logger("keyDownFunction()");

        if(e.keyCode === 27) {
            _logger("  -> esc");

            setSrc("");
            handleShowElement(e, "input-image", false);
            handleShowElement(e, "dateList", false);
            handleShowElement(e, "threeDotsMenu", false);
        }
    }, []);

    const focusFunction = (e) => {
         _logger("focusFunction()");
         _commonSetCommonInfo("chatFocused", true);
    };

    const blurFunction = (e) => {
        _logger("blurFunction()");
        _commonSetCommonInfo("chatFocused", false);
    };


// HANDLE  -------------------------------------------
    const handleShowLog = (e) => {
        var showLog = _commonGetCommonInfo("showLog");
        _commonSetCommonInfo("showLog", !showLog);
        document.getElementById("logAble").innerText = (!showLog).toLocaleString();

        _logger("handleShow_logger()", !showLog);
    };

    const handleSendMsg = async (e) => {
        _logger("handleSendMsg()");

        sendData();
    };

    const handleLogOut = async (e) => {
        _logger("handleLogOut()");

        try {
            await _authLogout();
        } catch (error) {
            _logger(error);
        }
    };

    const handleShowElement = (e, id, show) => {
        var element = document.getElementById(id);
        if(element) {
            var show = show == undefined ? element.style.display=='none' : show;
            show ? element.style.display = (id == 'dateList' ? 'flex' : 'block') : element.style.display = 'none';
        }

        _logger("handleShowElement()", id, show);
    };

    const changeDate = (e, date) => {
        _logger("changeDate()", "date : " + date.date + " / chatDate : " + _commonGetCommonInfo("chatDate"));

        handleShowElement(e, "dateList", false);
        if(date.date == _commonGetCommonInfo("chatDate")) {
            return;
        }

        var tempIsTodayChat = date.date == _commonGetToday();
        if(!tempIsTodayChat) {
            document.getElementById("textarea").disabled = true;
            document.getElementById("file_input").disabled = true;
            document.getElementById("textarea").style.cursor = "not-allowed";
            document.getElementById("fileSpan").style.cursor = "not-allowed";
        }else {
            document.getElementById("textarea").disabled = false;
            document.getElementById("file_input").disabled = false;
            document.getElementById("textarea").style.cursor = "auto";
            document.getElementById("fileSpan").style.cursor = "pointer";
        }

        if(tempIsTodayChat && emptyToday) {
            _logger("  -> chatList empty excute");
            chatTemp = [];
            setChatList([]);
        }else {
            _logger("  -> _databaseGetChatHistory excute");
            _databaseGetChatHistory(roomName, date.date, function (dbChatObj) {
                chatTemp = chatTemp.concat(dbChatObj);
                setChatList(chatTemp);
                scrollToBottom(0, "auto");
            });
            _commonSetCommonInfo("chatDate", date.date);
        }

        setIsTodayChat(tempIsTodayChat);
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
        _logger("handleMsgRightClick()", chatInfo);

        e.preventDefault();
        setReply(chatInfo.email+"-"+chatInfo.timestamp+"-"+chatInfo.message);
        document.getElementById("rmenu").className = "right_btn_show";
        document.getElementById("rmenu").style.top = mouseY(e) + 'px';
        document.getElementById("rmenu").style.left = mouseX(e) + 'px';
    }

    const handleMsgLeftClick = (e, isClose) => {
        _logger("handleMsgLeftClick()", isClose);

        if(!replyInfo || isClose) {
            setReply(null);
            if(document.getElementById("rmenu") && document.getElementById("rmenu").className == "right_btn_hide") {
                setReplyInfo(null);
            }
        }
        if(document.getElementById("rmenu")) {
            document.getElementById("rmenu").className = "right_btn_hide";
        }

        handleShowElement(e, "dateList", false);
        handleShowElement(e, "threeDotsMenu", false);
    }

    const handleRightMenu = (e) => {
        _logger("handleRightMenu()");

        e && e.preventDefault();
        document.getElementById("rmenu").className = "right_btn_hide";
        const replyData = document.getElementById("rmenu").getAttribute("data-reply");
        const replyEmail = replyData.split("-")[0];
        const replyId = replyData.split("-")[1];
        const replyMsg = replyData.split("-")[2];
        setReplyInfo(<span className="reply-email">{replyEmail+"님에게 답장"}<br/><span className="reply-msg">{replyMsg}</span></span>);
        document.getElementById("textarea").focus();
    }

    const handleTheme = (e, isInit) => {
        _logger("handleTheme()", isInit);

        if(!isInit) {
            _logger("  -> _databaseUpdateUserProfile excute");
            _databaseUpdateUserProfile("theme", themeInfo.theme == "dark" ? "light" : "dark", _authGetCurrentUser());
        }

        _commonHandleUserTheme(function(userThemeObj) {
            _logger("  -> _commonHandleUserTheme callback", userThemeObj.theme);

            setThemeInfo(userThemeObj);
            scrollToBottom(0, "auto");
            handleShowElement(e, "threeDotsMenu", false);
        })
    };

    const handleChatRemove = (e) => {
        _logger("handleChatRemove()");

        handleShowElement(e, "threeDotsMenu", false);

        var chatDate = _commonGetCommonInfo("chatDate");
        if(chatDate == _commonGetToday()) {
            return alert("당일대화는 삭제 할 수 없습니다.");
        }

        var check = confirm("'"+chatDate+"' 의 대화를 삭제하시겠습니까?");

        if(check) {
            loadingWithMask(e);
            _databaseRemoveChat(roomName, chatDate, function () {
                _logger("  -> _databaseRemoveChat callback");

                refreshDateList();
                closeLoadingWithMask(e);
            });
        }
    };

    const handleOnPaste = (e) => {
        _logger("handleOnPaste()");

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
                handleShowElement(e, "input-image", true);
            };
            reader.readAsDataURL(blob);

            var file = new File([blob], Date.now()+Math.floor(Math.random()*100));
            setImgFile(file);
        }
    };

    const handleChangeFile = (e) => {
        _logger("handleChangeFile()");

        for(var i=0;i<e.target.files.length;i++){
            if (e.target.files[i]) {
                let reader = new FileReader();
                reader.readAsDataURL(e.target.files[i]);
                reader.onloadend = () => {
                    const base64 = reader.result;
                    if (base64) {
                        var base64Str = base64.toString()
                        setSrc(base64Str);
                        handleShowElement(e, "input-image", true);

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
        e.target.value = ""; // 같은 파일 upload를 위한 처리
    }


// ETC ----------------------------------------------

    const scrollToBottom = (msTime, behavior) => {
        _logger("scrollToBottom()", msTime, behavior);

        if(!messageRef.current) return;
        setTimeout(() => {
            messageRef.current.scrollIntoView({ behavior: behavior ? behavior : "smooth", block: "end" })
        }, msTime);
    }

    const refreshDateList = (isInit) => {
        _logger("refreshDateList()");

        _databaseGetChatDayList(roomName, function(dateList) {
            _logger("  -> _databaseGetChatDayList callback");

            dateList = dateList == null ? [] :  Object.keys(dateList);
            var today = _commonGetToday();
            if(!dateList.includes(today)) {
                setEmptyToday(true);
                dateList.push(today);
            }
            setDateList(dateList);
        });
    };

    const loadingWithMask = (e) => {
        handleShowElement(e, "loadingMask", true);
    };

    const closeLoadingWithMask = (e) => {
        handleShowElement(e, "loadingMask", false);
    };

    const openImageModal = (e) => {
        _logger("openImageModal()");

        handleShowElement(e, "modal", true);

        let imgSrc;

        if(themeInfo.theme == "light") {
            imgSrc = document.getElementById(e.currentTarget.id).src;
        }else {
            imgSrc = document.getElementById(e.currentTarget.id).firstChild.innerHTML;
        }
        document.getElementById("modalBoxImg").src = imgSrc;
        if(window.outerHeight < document.getElementById("modalBoxImg").height) {
            document.getElementById("modalBoxImg").style.width = "auto";
            document.getElementById("modalBoxImg").style.height = "100%";
        }else {
            document.getElementById("modalBoxImg").style.height = "auto";
            document.getElementById("modalBoxImg").style.width = "100%";
        }
    };

    const closeImageModal = (e) => {
        _logger("closeImageModal()");

        handleShowElement(e, "modal", false);
    };

    const goToReplyMsg = (e, id) => {
        _logger("goToReplyMsg()", id);

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
        _logger("goToBackReplyMsg()", id);

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
        <div id="chat_wrap" className="chat_wrap" data-theme={themeInfo.theme}>
            <div className="header">
                <div id="threeDotsBtn">
                    <BsThreeDotsVertical onClick={(e)=>{
                        handleShowElement(e,"threeDotsMenu");
                        handleShowElement(e,"dateList", false);
                    }} />
                </div>
                <div className="title">{roomName}</div>
            </div>
            <div id="chat" className="chat" onClick={handleMsgLeftClick} onScroll={getScrollPoistion}>
                <ul>
                    {chatList && chatList.map((chat, index) => {
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
                        <span id="fileSpan">FILE</span>
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

            {/*threeDotsMenu*/}
            <div id="threeDotsMenu" className="list" style={{display:"none"}}>
                <ul>
                    <li className="date"
                        type="button"
                        onClick={(e)=>{
                            handleShowElement(e,"dateList", true);
                            handleShowElement(e,"threeDotsMenu", false);
                        }}>
                        DATE
                    </li>
                    <li className="mode"
                        type="button"
                        id="modeBtn"
                        onClick={handleTheme}>
                        {themeInfo.themeBtnValue}
                    </li>
                    <li className="logout"
                        type="button"
                        onClick={handleLogOut}>
                        LOGOUT
                    </li>
                    {isOwner &&
                    <li className="remove"
                        type="button"
                        id="removeBtn"
                        onClick={handleChatRemove}>
                        REMOVE
                    </li>
                    }
                    {isOwner &&
                    <li className="showLog"
                        type="button"
                        id="showLogBtn"
                        onClick={handleShowLog}>
                        LOGGING(<span id="logAble">{_commonGetCommonInfo("showLog").toLocaleString()}</span>)
                    </li>
                    }
                </ul>
            </div>

            {/*chat list*/}
            <div id="dateList" className="list" style={{display:"none"}}>
                <ul>
                    {dateList && dateList.map((date, index) => {
                        return <li key={index} onClick={(e)=>changeDate(e,{date})}>{date}</li>
                    })}
                </ul>
            </div>

            {/*loading*/}
            <div id="loadingMask">
                <div></div>
                <img id="loadingImg" src={process.env.PUBLIC_URL+"/loader.gif"} />
            </div>

            {/*limage box*/}
            <div id="modal" className="modal" onClick={closeImageModal}>
                <button onClick={closeImageModal}>&times;</button>
                <div id="modalBox" className="modalBox">
                    <img id="modalBoxImg" src="" />
                </div>
            </div>

            {/*reply*/}
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
