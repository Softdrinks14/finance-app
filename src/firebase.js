import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Tambahkan import untuk Auth dan Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBcEB336bYUoUvPcdYb2zC7j988CMpTRiQ",
  authDomain: "finance-24c5a.firebaseapp.com",
  projectId: "finance-24c5a",
  storageBucket: "finance-24c5a.firebasestorage.app",
  messagingSenderId: "600605702972",
  appId: "1:600605702972:web:92065c2659d0804adc3c39",
  measurementId: "G-PLN7HP33EN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inisialisasi dan Export layanan yang dibutuhkan oleh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);