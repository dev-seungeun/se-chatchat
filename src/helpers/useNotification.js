
const useNotification = (title, option) => {

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
    new Notification(title, option);
  }

};

export default useNotification;
