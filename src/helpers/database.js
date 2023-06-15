import { database, dbRef, dbChild, dbGet, dbSet, dbUpdate, dbRemove, dbQuery, dbOnChildAdded, dbOnChildChanged, dbRemoveEventListener, dbLimitToLast, dbEndAt, dbOrderByKey, dbOnValue, dbRefOff } from "../services/firebase";
import { _commonGetCommonInfo, _commonSetCommonInfo, _commonGetToday } from "./common"
import { _authGetCurrentUser } from "./auth"

export function getRef(url) {
    return dbRef(database, url);
}

export function get(url) {
    return dbGet( dbChild( dbRef(database), url ) );
}

export function update(url, key, value) {
    let tempObj = {};
    tempObj[key] = value;
    dbUpdate( dbRef(database, url), tempObj);
}

export function getPaging(url, from, listSize) {
    if(from == null) {
        return dbGet( dbQuery( getRef(url), dbOrderByKey(), dbLimitToLast(listSize) ) );
    }else {
        return dbGet( dbQuery( getRef(url), dbOrderByKey(), dbEndAt(from), dbLimitToLast(listSize) ) );
    }
}

export function _databaseGetRoomList(callback) {
    const url = "chats/rooms";

    get(url).then((snapshot) => {
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
    const url =  "chats/rooms/"+roomName+"/members";
    get(url).then((snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseGetUserProfile(currentUser, callback) {
    const url = "chats/profiles/"+currentUser.uid;
    get(url).then((snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseUpdateUserProfile(key, value, currentUser) {
    const url = "chats/profiles/"+currentUser.uid;
    update(url, key, value);
}

export function _databaseGetChatDayList(roomName, callback) {
    get("chats/rooms/"+roomName+"/messages").then((snapshot) => {
        callback(snapshot.val());
    });
}

export function _databaseGetTotalCnt(roomName, stdDate, callback) {
    get("chats/rooms/"+roomName+"/messages/").then((snapshot) => {
        if(!Object.keys(snapshot.val()).includes(stdDate)) {
            callback(0);
        }else {
            get("chats/rooms/"+roomName+"/messages/"+stdDate).then((snapshot) => {
                callback(Object.keys(snapshot.val()).length);
            });}
    })
}

export function _databaseGetChatHistory(roomName, stdDate, pageFrom, pageSize, callback) {
    const url = "chats/rooms/"+roomName+"/messages/"+stdDate;

    getPaging(url, pageFrom, pageSize).then((snapshot) => {

        var arr = Object.keys(snapshot.val());
        var firstKey = arr[0];

        var arr = Object.keys(snapshot.val());
        if(arr.length >= pageSize) {
            arr.shift();
        }

        // 마지막 대화쪽을 가져오기위해
        var reverseArr = arr.reverse();
        reverseArr.forEach((sendTime) => {
            callback(snapshot.val()[sendTime], String(firstKey));
        });

    });
}

export async function _databaseGetAddedChats(roomName, pageSize, totalCnt, callback) {
    const url = "chats/rooms/"+roomName+"/messages/"+_commonGetToday();
    var cnt = 0;
    var pageFrom = null;

    await dbOnChildAdded(getRef(url), (snapshot) => {

        if(snapshot.val().hasOwnProperty("uid")) {
            cnt++;

            // 새로추가되는 채팅
            if(totalCnt < cnt) {
                callback(snapshot.val(), pageFrom);
                
            // 최초진입 채팅 노출
            }else {

                // 페이징 저장
                if (totalCnt - cnt == pageSize) {
                    pageFrom = String(snapshot.val().timestamp);
                }
                
                // 최초 진입시에는 마지막쪽 대화만 pageSize만큼 노출
                if (totalCnt - cnt < pageSize) {
                    callback(snapshot.val(), pageFrom, true);
                }
            }
        }
    });

    return true;
}

export function _databaseSendChat(roomName, data) {
    const url = "chats/rooms/"+roomName+"/messages/"+_commonGetToday()+"/"+data.timestamp;
    return dbSet(getRef(url), {
        uid: data.uid,
        email: data.email,
        message: data.message,
        imgUrl: data.imgUrl,
        timestamp: data.timestamp,
        reply: data.reply
    });
}

export function _databaseGetChatTime(roomName, callback) {
    // date만 바뀌면 여기서 date만 리턴됨 > lastChat 전체 조회 후 callback
    const url = "chats/rooms/"+roomName+"/lastChat";
    dbOnChildChanged(getRef(url), (snapshot) => {
        if(snapshot.key == "date") {
            dbGet( dbChild ( dbRef(database), "chats/rooms/"+roomName+"/lastChat" ) ).then((snapshot) => {
                callback(snapshot.val());
            });
        }
    });
}

export function _databaseUpdateChatTime(roomName, currentUser) {
    const url = "chats/rooms/"+roomName+"/lastChat";
    return dbUpdate(getRef(url), {
        date: Date.now()+1000,
        uid : currentUser.uid,
        email: currentUser.email
    });
}

export function _databaseRemoveChat(roomName, date, callback) {
    const url = "chats/rooms/"+roomName+"/messages/"+date;
    dbRemove(getRef(url)).then(() => {
        callback();
    });
}

export function _databaseSaveChat(roomName, stdDate, data) {
    const url = "chats/rooms/"+roomName+"/saveData/"+stdDate+"/"+data.timestamp;
    return dbSet(getRef(url), {
        uid: data.uid,
        email: data.email,
        message: data.message,
        imgUrl: data.imgUrl,
        timestamp: data.timestamp
    });
}