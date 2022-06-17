import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { _commonGetCommonInfo, _commonSetCommonInfo } from "../helpers/common";
import { _databaseGetRoomsInfo, _databaseGetRoomsAuth } from "../helpers/database";
import { _authLogout, _authGetCurrentUser } from "../helpers/auth";
import { _sendNotification } from "../helpers/useNotification";
import "../rooms.css"

function Room() {

  const [roomList, setRoomList] = useState("");
  let navigate = useNavigate();
  let isMount = true;
  let selectedRoom = "";
  let checkRooms = {};

  const getRoomList = async() => {

    const callback = (rooms) => {

      Object.keys(rooms).forEach((roomName, index) => (
        _databaseGetRoomsAuth(roomName, function(res) {
          if(Object.keys(res).includes(_authGetCurrentUser().uid)) {
            checkRooms[roomName] = rooms[roomName]
          }

          if(index+1 == Object.keys(rooms).length) {
            const myList = () => {
              const list = Object.keys(checkRooms).map((roomName, index) => (
                <li key={createItem(index+"li")}>
                  <button
                    key={createItem(index+"room")}
                    className = "room"
                    type="button"
                    onClick={handleSelectRoom}
                    value={roomName}>
                    <span>{roomName}</span>
                  </button>
                </li>
              ));
              return <ul>{list}</ul>;
            };

            setRoomList(myList);
          }
        })
      ));

    }

    const notiCallback = (roomName, chatInfo) => {
      _databaseGetRoomsAuth(roomName, function(res) {
        if(Object.keys(res).includes(_authGetCurrentUser().uid)) {
          const selectedRoom = _commonGetCommonInfo("selectedRoom");
          if(chatInfo.date > Date.now()
                && (isMount || (!isMount && selectedRoom != roomName))) {
            notify(roomName, chatInfo, isMount ? false : true);
          }
        }
      })
    }

    _databaseGetRoomsInfo(callback, notiCallback);

  };

  const notify = (roomName, chat, replace) => {
    if(chat.uid !== _authGetCurrentUser().uid) {
      console.log("NOTI > from wating room")
      const res = _sendNotification('SESH', {
        body: chat.email,
        roomName : roomName
      },function(enterRoomName) {
        console.log("["+enterRoomName+"] 입장")
        _commonSetCommonInfo("selectedRoom", enterRoomName);
        navigate(`/chat/${enterRoomName}`, {replace: replace});
      });
      // console.log(res)
    }
  }


// USE EFFECT  ---------------------------------------
  useEffect(() => {
    getRoomList();
    _commonSetCommonInfo("selectedRoom", "");
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
      _databaseGetRoomsAuth(roomName, function(res) {
        if(Object.keys(res).includes(_authGetCurrentUser().uid)) {
          console.log("["+roomName+"] 입장")
          _commonSetCommonInfo("selectedRoom", roomName);
          navigate(`/chat/${roomName}`);
        }else {
          alert("'"+roomName+"' 방 입장권한이 없습니다.")
        }
      })
    }
  };

  const handleGoogleLogOut = async () => {
    try {
      await logout();
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
