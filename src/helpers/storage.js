import { storage, storage_ref, storage_upload_bytes, storage_download_url } from "../services/firebase";
import { _commonGetToday } from "../helpers/common";

export function _storageSendImg(roomName, imgFile, callback) {
  const fileName = Date.now()+"_"+Math.floor(Math.random() * 100)+".png";
  storage_upload_bytes(storage_ref(storage, _commonGetToday()+"/"+roomName+"/images/"+fileName), imgFile)
    .then((snapshot) => {
      console.log(snapshot);
      callback(fileName);
    })
    .catch((error) => {
      callback();
      console.log(error);
    });
}

export function _storageDownloadImg(roomName, fileName, callback) {
  const storageRef = storage_download_url(storage_ref(storage, _commonGetToday()+"/"+roomName+"/images/"+fileName))
    .then((url) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = (event) => {
        const blob = xhr.response;
      };
      xhr.open("GET", url);
      xhr.send();
      callback(url);
    })
    .catch((error) => {
      callback();
    });
}
