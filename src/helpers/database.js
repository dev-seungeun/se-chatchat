import { database, database_ref, database_set, database_update, database_query, database_limit_to_last,
         database_on_child_added, database_on_child_changed, database_on_value } from "../services/firebase";
import { _commonGetCommonInfo, _commonSetCommonInfo } from "./common"

export function _databaseGetRoomsInfo(callback, notiCallback) {
  const roomRef = database_ref(database, "chats/rooms");
  database_on_value(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  if(!_commonGetCommonInfo('roomsInfo')) {
    database_on_child_changed(roomRef, (snapshot) => {
      notiCallback(snapshot.key, snapshot.val());
    });
  }
  _commonSetCommonInfo('roomsInfo', true);
}

export function _databaseGetRoomsAuth(roomName, callback) {
  const roomAuthRef = database_query(database_ref(database, 'chats/'+roomName+"/members"), database_limit_to_last(10));
  database_on_value(roomAuthRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function _databaseSendChatTime(roomName, uid) {
  return database_update(database_ref(database, 'chats/rooms/'+roomName), {
    date: Date.now()+1000,
    uid : uid
  });
}

export function _databaseSendChat(roomName, data) {
  const date = new Date();
  const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
  return database_set(database_ref(database, 'chats/'+roomName+"/messages/"+today+"/"+data.timestamp), {
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
  const chatRef = database_query(database_ref(database, 'chats/'+roomName+"/messages/"+today), database_limit_to_last(10));
  database_on_child_added(chatRef, (snapshot) => {
    if(snapshot.val().hasOwnProperty("uid")) {
      callback(snapshot.val());
    }
  });
}
