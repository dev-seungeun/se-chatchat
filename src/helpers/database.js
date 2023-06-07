import { database, dbRef, dbChild, dbGet, dbSet, dbUpdate, dbRemove, dbQuery, dbLimitToLast, dbOnChildAdded, dbOnChildChanged, dbOnValue, dbRemoveEventListener, dbRefOff } from "../services/firebase";
import {_commonGetCommonInfo, _commonSetCommonInfo, _commonGetToday} from "./common"
import { _authGetCurrentUser } from "./auth"

export function _databaseGetRoomList(callback) {
    dbGet( dbChild( dbRef(database), "chats/rooms" ) ).then((snapshot) => {
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
    dbGet( dbChild( dbRef(database), "chats/rooms/"+roomName+"/members" ) ).then((snapshot) => {
        callback(snapshot.val());
    });
}

// TODO
export function _databaseGetChatTime(roomName, callback) {
    const ref = dbRef(database, "chats/rooms/"+roomName+"/lastChat" );
    dbOnChildChanged(ref, (snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseUpdateChatTime(roomName, currentUser) {
    const ref = dbRef(database, "chats/rooms/"+roomName+"/lastChat");
    return dbUpdate(ref, {
        date: Date.now()+1000,
        uid : currentUser.uid,
        email: currentUser.email
    });
}

export function _databaseGetUserProfile(currentUser, callback) {
    dbGet( dbChild( dbRef(database), "chats/profiles/"+currentUser.uid ) ).then((snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseUpdateUserProfile(key, value, currentUser) {
    const ref = dbRef(database, "chats/profiles/"+currentUser.uid);
    let tempObj = {};
    tempObj[key] = value;
    dbUpdate(ref, tempObj);
}

export function _databaseSendChat(roomName, data) {
    const ref = dbRef(database, "chats/rooms/"+roomName+"/messages/"+_commonGetToday()+"/"+data.timestamp);
    return dbSet(ref, {
        uid: data.uid,
        email: data.email,
        message: data.message,
        imgUrl: data.imgUrl,
        timestamp: data.timestamp,
        reply: data.reply
    });
}

// TODO
export async function _databaseOffRef(roomName) {
    const url = "chats/rooms/"+roomName+"/messages/"+_commonGetToday();
    const ref = dbRef(database, url);
    ref.off();
}

export async function _databaseGetAddedChats(roomName, callback) {
    const url = "chats/rooms/"+roomName+"/messages/"+_commonGetToday();
    const ref = dbRef(database, url);
    await dbOnChildAdded(ref, (snapshot) => {
        if(snapshot.val().hasOwnProperty("uid")) {
            callback(snapshot.val());
        }
    });
    return true;
}

export function _databaseGetChatHistory(roomName, stdDate, callback) {
    const url = "chats/rooms/"+roomName+"/messages/"+stdDate;
    dbGet( dbChild( dbRef(database), url ) ).then((snapshot) => {
        Object.keys(snapshot.val()).forEach((sendTime) => {
            callback(snapshot.val()[sendTime]);
        });
    });
}

export function _databaseGetChatDayList(roomName, callback) {
    dbGet( dbChild( dbRef(database), "chats/rooms/"+roomName+"/messages" ) ).then((snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseRemoveChat(roomName, date, callback) {
    var ref = dbRef(database, "chats/rooms/"+roomName+"/messages/"+date);
    dbRemove(ref).then(() => {
        callback();
    });
}

// export function _databaseGetCountChats(roomName, callback) {
//   const date = new Date();
//   const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);;
//   const chatRef = dbQuery(dbRef(database, "chats/rooms/"+roomName+"/messages/"+today), limit_to_last(50));
//   dbOnValue(chatRef, (snapshot) => {
//     callback(Object.keys(snapshot.val()).length)
//   });
// }
