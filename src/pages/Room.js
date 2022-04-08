import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../helpers/database";
import "../rooms.css"

function Room() {

  const [rooms, setRooms] = useState("");
  let navigate = useNavigate();

  useEffect(() => {
    getRoomList();
  }, []);

  let itemId = 1;
  const createItem = (text) => {
    return (itemId++) + text;
  }

  const handleSelectRoom = async (e) => {
    e.preventDefault();
    const roomName = e.target.value;
    navigate(`/chat?room=${roomName}`);
  };

  const getRoomList = () => {
    const roomObject = getRooms();
    const myList = () => {
      const list = Object.keys(roomObject).map((roomName, index) => (
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
  };

  return (
    <div className="room-wrap">
      <div>
        {rooms}
      </div>
    </div>
  );
}

export default Room;
