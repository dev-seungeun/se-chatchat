import { useNavigate } from "react-router-dom";

var notifyArr = [];

export function _sendNotification(title, option, callback) {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        try {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") return;
            });
        } catch (error) {
            if (error instanceof TypeError) {
                Notification.requestPermission((permission) => {
                    if (permission !== "granted") return;
                });
            } else {
                console.error(error);
            }
        }
    }else {
        var notification = new Notification(title, option);

        var roomNotify = notifyArr.find(x => x.roomName == option.roomName);
        if(roomNotify == undefined) {
            notifyArr.push({roomName: option.roomName, notify: [notification]});
        }else {
            roomNotify.notify.push(notification);
        }


        notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            callback && callback(option.roomName);
        }
    }

};

export function _removeRoomNotifys(roomName){
    var roomNotify = notifyArr.find(x => x.roomName == roomName);
    if(roomNotify != undefined) {
        for(var i=0; i<roomNotify.notify.length;i++){
            roomNotify.notify[i].close();
        }
        roomNotify.notify = [];
    }
}
