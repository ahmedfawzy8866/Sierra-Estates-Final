import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZLN2jTTKV34SneGPoWRz1zoRpX5uODjs",
  authDomain: "sierra-blu.firebaseapp.com",
  projectId: "sierra-blu",
  storageBucket: "sierra-blu.firebasestorage.app",
  messagingSenderId: "941030513456",
  appId: "1:941030513456:web:7ea785e8287741967086f5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
