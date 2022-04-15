import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, getRoomsAuth } from "../helpers/database";
import { authService } from "../services/firebase";
import { logout } from "../helpers/auth";
import "../rooms.css"

function Room() {

  const [rooms, setRooms] = useState("");
  let navigate = useNavigate();

  const getRoomList = async() => {
    getRooms(function(roomObject) {
      const myList = () => {
        const list = Object.values(roomObject).map((roomName, index) => (
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

      setRooms(myList);

    });
  };


// USE EFFECT  ---------------------------------------
  useEffect(() => {
    getRoomList();
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
        {rooms}
      </div>
    </div>
  );
}

export default Room;
