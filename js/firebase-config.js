/* ============================================================
   AquaServe — Firebase Configuration
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzDYr8zh3WhkbwsXJKuYnA9tg0U2okdlU",
  authDomain: "aquaserve-153ff.firebaseapp.com",
  projectId: "aquaserve-153ff",
  storageBucket: "aquaserve-153ff.firebasestorage.app",
  messagingSenderId: "670388046751",
  appId: "1:670388046751:web:bbb2ab0141da648d208baa",
  measurementId: "G-36NXKQ0XTB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
