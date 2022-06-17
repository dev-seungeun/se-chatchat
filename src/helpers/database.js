import { database, database_ref, database_set, database_get, database_child, database_update, database_query,
         database_limit_to_last, database_on_child_added, database_on_child_changed, database_on_value } from "../services/firebase";
import { _commonGetCommonInfo, _commonSetCommonInfo } from "./common"
import { _authGetCurrentUser } from "./auth"

export function _databaseGetRoomList(callback) {
  const roomRef = database_ref(database, "chats/rooms");
  database_on_value(roomRef, (snapshot) => {
    let roomNameList = [];
    Object.keys(snapshot.val()).forEach((roomName, index) => {
      if(snapshot.val()[roomName].members && Object.keys(snapshot.val()[roomName].members).includes(_authGetCurrentUser().uid)) {
        roomNameList.push(roomName);
      }
    });
    callback(roomNameList);
  });
}

export function _databaseGetChatTime(callback) {
  const roomRef = database_ref(database, "chats/rooms");
  database_on_child_changed(roomRef, (snapshot) => {
    if(Object.keys(snapshot.val().members).includes(_authGetCurrentUser().uid)) {
      callback(snapshot.key, snapshot.val().lastChat);
    }
  });
}

export function _databaseUpdateChatTime(roomName, currentUser) {
  return database_update(database_ref(database, "chats/rooms/"+roomName+"/lastChat"), {
    date: Date.now()+1000,
    uid : currentUser.uid,
    email: currentUser.email
  });
}

export function _databaseGetUserProfile(currentUser, callback) {
  database_get(database_child(database_ref(database), "chats/profiles/"+currentUser.uid)).then((snapshot) => {
    callback(snapshot.val());
  });
}

export function _databaseUpdateUserProfile(key, value, currentUser) {
  let tempObj = {};
  tempObj[key] = value;
  database_update(database_ref(database, "chats/profiles/"+currentUser.uid), tempObj);
}

export function _databaseSendChat(roomName, data) {
  const date = new Date();
  const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
  return database_set(database_ref(database, "chats/rooms/"+roomName+"/messages/"+today+"/"+data.timestamp), {
    uid: data.uid,
    email: data.email,
    message: data.message,
    imgUrl: data.imgUrl,
    timestamp: data.timestamp
  });
}

export function _databaseGetAddedChats(roomName, callback) {
  const date = new Date();
  const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);;
  let chatList = [];
  let lastChat = null;
  const chatRef = database_query(database_ref(database, "chats/rooms/"+roomName+"/messages/"+today), database_limit_to_last(10));
  database_on_child_added(chatRef, (snapshot) => {
    if(snapshot.val().hasOwnProperty("uid")) {
      callback(snapshot.val());
    }
  });
}
