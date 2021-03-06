import { database, database_ref, database_set, database_get, database_child, database_update, database_query,
         database_limit_to_last, database_on_child_added, database_on_child_changed, database_on_value } from "../services/firebase";
import { _commonGetCommonInfo, _commonSetCommonInfo } from "./common"
import { _authGetCurrentUser } from "./auth"

export function _databaseGetRoomList(callback) {
  // const roomRef = database_ref(database, "chats/rooms");
  // database_on_value(roomRef, (snapshot) => {
  database_get(database_child(database_ref(database), "chats/rooms")).then((snapshot) => {
    let roomNameList = [];
    Object.keys(snapshot.val()).forEach((roomName, index) => {
      if(snapshot.val()[roomName].members && Object.keys(snapshot.val()[roomName].members).includes(_authGetCurrentUser().uid)) {
        roomNameList.push(roomName);
      }
    });
    callback(roomNameList);
  });
}

export function _databaseGetRoomAuth(roomName, callback) {
  const roomRef = database_ref(database, "chats/rooms/"+roomName+"/members");
  database_on_value(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function _databaseGetChatTime(roomName, callback) {
  const roomRef = database_ref(database, "chats/rooms/"+roomName+"/lastChat");
  database_on_child_changed(roomRef, (snapshot) => {
    if(snapshot.key == "date") {
      database_get(database_child(database_ref(database), "chats/rooms/"+roomName+"/lastChat")).then((snapshot) => {
        callback(snapshot.val());
      });
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
    timestamp: data.timestamp,
    reply: data.reply
  });
}

export async function _databaseGetAddedChats(roomName, callback) {
    const date = new Date();
    const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);;
    const chatRef = database_query(database_ref(database, "chats/rooms/"+roomName+"/messages/"+today), database_limit_to_last(50));
    await database_on_child_added(chatRef, (snapshot) => {
      if(snapshot.val().hasOwnProperty("uid")) {
        callback(snapshot.val());
      }
    });
    return true;
}

// export function _databaseGetCountChats(roomName, callback) {
//   const date = new Date();
//   const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);;
//   const chatRef = database_query(database_ref(database, "chats/rooms/"+roomName+"/messages/"+today), database_limit_to_last(50));
//   database_on_value(chatRef, (snapshot) => {
//     callback(Object.keys(snapshot.val()).length)
//   });
// }
