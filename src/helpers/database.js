import { database, database_set, database_ref, database_update, database_on_value } from "../services/firebase";
import { onChildAdded, onChildChanged, off, get, child, onValue, query, orderByKey, orderByChild, limitToLast, startAt } from "firebase/database";

const info = {roomsInfo: false, addedChats: {}, selectedRoom: "", themeInfo: {theme:"light", themeTxt:"DARK"}};

export function getCommonInfo(key) {
    return info[key];
}
export function setCommonInfo(key, value) {
    info[key] = value;
}

export function getRoomsInfo(callback, notiCallback) {
  const roomRef = database_ref(database, "chats/rooms");
  onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  if(!info.roomsInfo) {
    onChildChanged(roomRef, (snapshot) => {
      notiCallback(snapshot.key, snapshot.val());
    });
  }
  info.roomsInfo = true;
}

export function getRoomsAuth(roomName, callback) {
  const roomAuthRef = query(database_ref(database, 'chats/'+roomName+"/members"), limitToLast(10));
  onValue(roomAuthRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function sendChatTime(roomName, uid) {
  return database_update(database_ref(database, 'chats/rooms/'+roomName), {
    date: Date.now()+1000,
    uid : uid
  });
}

export function sendChat(roomName, data) {
  const date = new Date();
  const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
  return database_set(database_ref(database, 'chats/'+roomName+"/messages/"+today+"/"+data.timestamp), {
    message: data.message,
    timestamp: data.timestamp,
    email: data.email,
    uid: data.uid
  });
}

export function getAddedChats(roomName, callback) {
  const date = new Date();
  const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);;
  let chatList = [];
  let lastChat = null;
  const chatRef = query(database_ref(database, 'chats/'+roomName+"/messages/"+today), limitToLast(10));
  onChildAdded(chatRef, (snapshot) => {

    if(snapshot.val().hasOwnProperty("uid")) {
      // chatList.push(snapshot.val());
      callback([snapshot.val()]);
    }
    // callback(chatList);

    // checkMsg(roomName, today, function(checkResult) {
    //   if(checkResult) {
    //     console.log(chatList);
    //     parentCall(chatList);
    //   }
    // });

  });
  callback(chatList, true);
}

async function checkMsg(roomName, today, callback) {
  // 마지막 childAdded (10개) 만 그려주기 위해
  var index = 0;
  get(child(database_ref(database), 'chats/'+roomName+"/messages/"+today))
  .then((snapshot_sub) => {
    snapshot_sub.forEach(function(chat) {
      index = index + 1;
      if(snapshot_sub.size == index) {
        callback(true);
      }else {
        callback(false);
      }
    });
  }).catch((error) => {
    console.error(error);
    callback(false);
  });
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
