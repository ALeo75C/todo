import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const config = {
  apiKey: "AIzaSyBqB309W9FbzJxy8C87KAI0DY3EHjScVBM",
  authDomain: "todobd-f20dc.firebaseapp.com",
  databaseURL:
    "https://todobd-f20dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todobd-f20dc",
  storageBucket: "todobd-f20dc.appspot.com",
  messagingSenderId: "695062420653",
  appId: "1:695062420653:web:ebf974438b321e9ce17a24",
};

const app = firebase.initializeApp(config);

export const db = getDatabase();
export const storage = getStorage(app);

export default firebase;
