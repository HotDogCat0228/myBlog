import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 配置 - 請替換為你的真實配置
const firebaseConfig = {
  apiKey: "AIzaSyAQt5ZeWxcRf_1fzM5jaxw_d7DB9lo3oOs",
  authDomain: "my-blog-project-85c66.firebaseapp.com",
  projectId: "my-blog-project-85c66",
  storageBucket: "my-blog-project-85c66.firebasestorage.app",
  messagingSenderId: "842260262180",
  appId: "1:842260262180:web:7b5a8ac684a7275bdd17b1",
  measurementId: "G-5QJTT37VEC"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
