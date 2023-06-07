import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, off, set, get, child, update, remove, onChildAdded, onChildChanged, onValue, query, limitToLast } from "firebase/database";
import { getStorage, ref as st_ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

// auth
export const auth  = getAuth();
export const createUserEmail  = createUserWithEmailAndPassword;
export const signInEmail  = signInWithEmailAndPassword;
export const googleProvider  = new GoogleAuthProvider();
export const signInGooglePopup  = signInWithPopup;


// database
export const database = getDatabase();
export const dbRef = ref;
export const dbRefOff = off;
export const dbSet = set;
export const dbGet = get;
export const dbChild = child;
export const dbUpdate = update;
export const dbRemove = remove;
export const dbQuery = query;
export const dbLimitToLast= limitToLast;
export const dbOnChildAdded = onChildAdded;
export const dbOnChildChanged = onChildChanged;
export const dbOnValue = onValue;

// storage
export const storage = getStorage();
export const storageRef = st_ref;
export const storageUploadBytes = uploadBytes;
export const storageGetDownloadURL = getDownloadURL;
