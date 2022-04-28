import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomsInfo, getRoomsAuth } from "../helpers/database";
import { authService } from "../services/firebase";
import { logout } from "../helpers/auth";
import useNotification from "../helpers/useNotification";
import "../rooms.css"

function Room() {

  const [roomList, setRoomList] = useState("");
  let navigate = useNavigate();
  let isMount = true;

  const getRoomList = async() => {

    const callback = (rooms) => {

      const myList = () => {
        const list = Object.keys(rooms).map((roomName, index) => (
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

    const notiCallback = (roomName, chatInfo) => {
      if(chatInfo.date > Date.now()) {
        if(isMount) {
          notify(roomName, chatInfo.uid);
        }
      }
    }

    getRoomsInfo(callback, notiCallback);

  };

  const notify = (roomName, uid) => {
    if(uid !== authService.currentUser.uid) {
      useNotification('SESH', {
        body: "from '"+roomName+"''"
      });
    }
  }


// USE EFFECT  ---------------------------------------
  useEffect(() => {
    getRoomList();
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
      getRoomsAuth(roomName, function(res) {
        if(Object.keys(res).includes(authService.currentUser.uid)) {
          console.log("["+roomName+"] 입장")
          navigate(`/chat?room=${roomName}`);
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
