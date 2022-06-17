import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, update, onChildAdded, onChildChanged, onValue, query, limitToLast } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
export const database_ref = ref;
export const database_set = set;
export const database_update = update;
export const database_query = query;
export const database_limit_to_last= limitToLast;
export const database_on_child_added = onChildAdded;
export const database_on_child_changed = onChildChanged;
export const database_on_value = onValue;

// storage
export const storage  = getStorage();
export const storage_ref  = storageRef;
export const storage_upload_bytes  = uploadBytes;
export const storage_download_url = getDownloadURL;
