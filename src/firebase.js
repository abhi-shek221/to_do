// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
// Your web app's Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBDMbaMxJSFKPvSbaERSqauN8Fp0m3sb_U",
  authDomain: "to-do-262df.firebaseapp.com",
  projectId: "to-do-262df",
  storageBucket: "to-do-262df.firebasestorage.app",
  messagingSenderId: "996720685244",
  appId: "1:996720685244:web:20df91b44fa73eac6aa0b9",
  measurementId: "G-5NHFZH9YGB",
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const db = getFirestore(app);

// Enable network explicitly to ensure Firestore writes work
enableNetwork(db)
  .then(() => {
    console.log("Firestore network enabled");
  })
  .catch((error) => {
    console.error("Error enabling Firestore network:", error);
  });

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Network helper functions
export const forceOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

export default app;
