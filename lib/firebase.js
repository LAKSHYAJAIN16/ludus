import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwGorlrVBv9jYCzEimdF0XuUPudeHj1L4",
  authDomain: "ludus-buf.firebaseapp.com",
  projectId: "ludus-buf",
  storageBucket: "ludus-buf.appspot.com",
  messagingSenderId: "136265586350",
  appId: "1:136265586350:web:b91500a90ee5a6f4e27f3f",
  measurementId: "G-KFJFKYQ671",
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
