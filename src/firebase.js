
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyCNWJuk6YblNTMIJAkcjsYMOBWskI2N2dg",
    authDomain: "booth-aia.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "booth-aia",
    storageBucket: "booth-aia.firebasestorage.app",
    messagingSenderId: "241305934309",
    appId: "1:241305934309:web:06f919ec7bba3f2fd9370c",
    measurementId: "G-44E1MLNN4Z"
  };
  

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
