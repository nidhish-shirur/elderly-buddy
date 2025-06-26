// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAnifgRO9VnKHGxiQXBo1VWZT1v_27oUg",
  authDomain: "elderlyassistant-31e55.firebaseapp.com",
  projectId: "elderlyassistant-31e55",
  storageBucket: "elderlyassistant-31e55.appspot.com",
  messagingSenderId: "568035993669",
  appId: "1:568035993669:web:08d64f93807de09ab65b2c",
  measurementId: "G-BPNGLFFNPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth, Firestore, and Storage instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 