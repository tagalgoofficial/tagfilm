import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBTLp5xPNwuC0qXvQzQiWesCGBA0VOAw8c",
  authDomain: "tagalgo.firebaseapp.com",
  projectId: "tagalgo",
  storageBucket: "tagalgo.firebasestorage.app",
  messagingSenderId: "712483129343",
  appId: "1:712483129343:web:18dd9857757cbc3af2c9ca",
  measurementId: "G-YYN80LPFQZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
