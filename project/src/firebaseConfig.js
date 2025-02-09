import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Ensure environment variables are accessible
const firebaseConfig = {
  apiKey: "AIzaSyAvb9o5AgKvQQSrlqTu3OL3iyCD4KO2958",
  authDomain: "recipe-maker-e7d03.firebaseapp.com",
  projectId: "recipe-maker-e7d03",
  storageBucket: "recipe-maker-e7d03.firebasestorage.app",
  messagingSenderId: "466841818446",
  appId: "1:466841818446:web:342ff170679ba4b3b7ba1f"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };