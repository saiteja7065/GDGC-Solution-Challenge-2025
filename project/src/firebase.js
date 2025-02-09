import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAvb9o5AgKvQQSrlqTu3OL3iyCD4KO2958",
  authDomain: "recipe-maker-e7d03.firebaseapp.com",
  projectId: "recipe-maker-e7d03",
  storageBucket: "recipe-maker-e7d03.firebasestorage.app",
  messagingSenderId: "466841818446",
  appId: "1:466841818446:web:342ff170679ba4b3b7ba1f"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export default app;