
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef12345678",
    measurementId: "G-XXXXXXXXXX"
  };
  

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
