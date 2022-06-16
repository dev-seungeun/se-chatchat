
import { useNavigate } from "react-router-dom";

// function go(path) {
//   console.log("go > "+path)
  // const navigate = useNavigate();
  // navigate(path);
  // history.push(path)
// }
export function _sendNotification(title, option, callback) {

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    try {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') return;
      });
    } catch (error) {
      if (error instanceof TypeError) {
        Notification.requestPermission((permission) => {
          if (permission !== 'granted') return;
        });
      } else {
        console.error(error);
      }
    }
  }else {
    // let roomName = option.body.split("from '")[1];
    // roomName = option.roomName; //roomName.substring(0, roomName.length-1);
    var notification = new Notification(title, option);
    // self.addEventListener('notificationclick', function(event) {
    notification.onclick = function(event) {
      event.preventDefault();
      console.log("focus!!");
      window.focus();
      // const path = "http://localhost:3000/#/chat?room="+option.roomName;
      callback(option.roomName);
      // routeChange(path)
      // document.location.href = path;
      // return path;
      // go(path)

      // console.log(url);
      // window.open(url, "_self");

      // navigate(`/chat?room=${title}`);
      // notificationRef.close();
    }
  }

};
