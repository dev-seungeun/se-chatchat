import { database, database_set, database_ref, database_on_value } from "../services/firebase";
import { onChildAdded, onValue, query, orderByKey, orderByChild, limitToLast, startAt } from "firebase/database";

export function getRooms(callback) {
  const roomRef = database_ref(database, "chats");
  onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function sendChat(roomName, data) {
  return database_set(database_ref(database, 'chats/'+roomName+"/"+data.timestamp), {
    message: data.message,
    timestamp: data.timestamp,
    email: data.email,
    uid: data.uid
  });
}

export function getAddedChats(roomName, callback) {
  const date = new Date();
  const today = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)).getTime();
  let chatList = [];
  const chatRef = query(database_ref(database, 'chats/'+roomName), orderByKey(), startAt(today.toString()), limitToLast(10));
  onChildAdded(chatRef, (snapshot) => {
    chatList.push(snapshot.val());
    callback(chatList);
  });
  callback(chatList, true);
}

/*
export function getChats(roomName, callback) {
  let chatList = [];
  const date = new Date();
  const today = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)).getTime();
  const chatRef = query(database_ref(database, 'chats/'+roomName), orderByKey(), startAt(today.toString()), limitToLast(10));
  const chatRef2 = database_ref(database);
  get(child(chatRef2, 'chats/'+roomName), limitToLast(10)).then((snapshot) => {
    snapshot.forEach((row) => {
      chatList.push(row.val());
    });
  },[]);
  callback(chatList);
}
*/
