import { database, database_set, database_ref, database_on_value } from "../services/firebase";
import { onValue, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";

export function getRooms() {
  let rooms = {};
  const roomRef = database_ref(database, "chats");
  onValue(roomRef, (snapshot) => {
    rooms = snapshot.val();
  });
  return rooms;
}

export function sendChat(roomName, data) {
  return database_set(database_ref(database, 'chats/'+roomName+"/"+data.timestamp), {
    message: data.message,
    timestamp: data.timestamp,
    email: data.email,
    uid: data.uid
  });
}

export function getChats(roomName) {
  let chats = [];
  const chatRef = database_ref(database, "chats/"+roomName);
  onValue(chatRef, (snapshot) => {
    snapshot.forEach((row) => {
      chats.push(row.val());
    });
  });
  return chats;
}

export const chatOnValue = onValue;
export const chatOnChildAdded = onChildAdded;
export const chatOnChildChanged = onChildChanged;
export const chatOnChildRemoved = onChildRemoved;
