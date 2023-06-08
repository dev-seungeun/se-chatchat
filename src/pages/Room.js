import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {_commonGetCommonInfo, _commonGetToday, _commonSetCommonInfo, _logger} from "../helpers/common";
import { _databaseGetRoomList, _databaseGetChatTime } from "../helpers/database";
import { _authLogout, _authGetCurrentUser } from "../helpers/auth";
import { _sendNotification} from "../helpers/useNotification";
import "../style/rooms.css"

function Room() {

    const [roomList, setRoomList] = useState("");
    let navigate = useNavigate();
    let isMount = true;

    const getRoomList = async() => {

        var savedRoomList = _commonGetCommonInfo("roomList");

        if(savedRoomList.length > 0) {
            drawRoomList(savedRoomList);
            _logger("savedRoomList", savedRoomList);

        }else {
            _databaseGetRoomList(function(roomNameList) {
                _logger("  -> _databaseGetRoomList() callback", roomNameList);

                roomNameList.forEach((roomName, i) => {
                    _databaseGetChatTime(roomName, function(chatInfo) {
                        _logger("  -> _databaseGetChatTime() callback", chatInfo);

                        const selectedRoom = _commonGetCommonInfo("selectedRoom");
                        if(chatInfo.date > Date.now() && (selectedRoom != roomName || !_commonGetCommonInfo("chatFocused") || _commonGetCommonInfo("chatDate") != _commonGetToday())) {
                            var noBackReplace = selectedRoom != "";
                            notify(roomName, chatInfo, noBackReplace);
                        }
                    })
                });

                _commonSetCommonInfo("roomList", roomNameList);

                drawRoomList(roomNameList);
            });
        }

    };

    const drawRoomList = (roomNameList) => {

        if(roomNameList.length == 0) {
            alert("모든 방에 권한이 없습니다.\n관리자에게 문의해주세요.");
            _authLogout();
        }else {

            const myList = () => {
                const list = roomNameList.map((roomName, index) => (
                    <li key={createItem(index+"li")}>
                        <button
                            key={createItem(index+"room")}
                            className = "room"
                            type="button"
                            onClick={handleSelectRoom}
                            value={roomName}>
                            {roomName}
                        </button>
                    </li>
                ));
                return <ul>{list}</ul>
            };

            setRoomList(myList);

        }
    }

    const notify = (roomName, chat, noBackReplace) => {
        if(chat.uid !== _authGetCurrentUser().uid) {
            console.log("NOTIFICATION ["+roomName+"] // FROM ["+chat.email+"]");
            _sendNotification("SESH", {
                    body: chat.email,
                    roomName : roomName
                }
                ,function(enterRoomName) {
                  console.log("ENTER ["+enterRoomName+"] BY NOTIFICATION")
                  _commonSetCommonInfo("selectedRoom", enterRoomName);
                  navigate(`/chat/${enterRoomName}?${chat.date}`, {replace: noBackReplace, state: {roomName: enterRoomName}});
                }
            );
        }
    }


// USE EFFECT  ---------------------------------------
    useEffect(() => {

        getRoomList();
        _commonSetCommonInfo("selectedRoom", "");
        isMount = true;

        return() => {
            isMount = false;
        }
    }, []);


// HANDLE  -------------------------------------------
    const handleSelectRoom = async (e) => {
        e.preventDefault();
        const roomName = e.target.value;
        if(roomName == undefined || roomName == "undefined") {
            alert("방을 다시 선택해주세요");
        }else {
            console.log("ENTER ["+roomName+"] BY SELECT")
            _commonSetCommonInfo("selectedRoom", roomName);
            navigate(`/chat/${roomName}`);
        }
    };

    const handleGoogleLogOut = async () => {
        try {
            await _authLogout();
        } catch (error) {
            console.log(error);
        }
    };


// ETC ----------------------------------------------
    let itemId = 1;
    const createItem = (text) => {
        return (itemId++) + text;
    }


// --------------------------------------------------


    return (
        <div className="room-wrap">
            <button
                className="logout-room"
                type="button"
                onClick={handleGoogleLogOut}>
                LOGOUT
            </button>
            <br/><br/>
            <div>
                {roomList}
            </div>
        </div>
    );
}

export default Room;
