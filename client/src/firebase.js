// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "truehomes-8281e.firebaseapp.com",
  projectId: "truehomes-8281e",
  storageBucket: "truehomes-8281e.firebasestorage.app",
  messagingSenderId: "413305084814",
  appId: "1:413305084814:web:c5a6ea2bcd6cd69e84e2df",
  measurementId: "G-XZYSG4RJ2F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    