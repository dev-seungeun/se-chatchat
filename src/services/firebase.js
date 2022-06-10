// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDALXwaSsR2scjhKgXh0ZRJyCG1mxDQfkI",
  authDomain: "sesh-chatchat.firebaseapp.com",
  databaseURL: "https://sesh-chatchat-default-rtdb.firebaseio.com/",
  projectId: "sesh-chatchat",
  storageBucket: "sesh-chatchat.appspot.com",
  messagingSenderId: "1053448136200",
  appId: "1:1053448136200:web:5839a033656f4e066cd3bd",
  measurementId: "G-SXGKJSS86S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

export const database = getDatabase();
export const database_ref = ref;
export const database_set = set;
export const database_update = update;

export const storage  = getStorage();
export const storage_ref  = storageRef;
export const upload_byte  = uploadBytes;
export const down_url = getDownloadURL;

export const authService  = getAuth();
export const createUserEmail  = createUserWithEmailAndPassword;
export const signInEmail  = signInWithEmailAndPassword;
export const googleProvider  = provider;
export const signInGooglePopup  = signInWithPopup;
