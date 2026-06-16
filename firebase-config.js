/* ============================================================
   EMPIRE RP STAFF PORTAL — FIREBASE CONFIG
   ============================================================
   This is the ONLY file you need to edit to connect the portal
   to your Firebase project. Full setup walkthrough is in
   FIREBASE-SETUP.md.

   Where to get these values:
   Firebase Console → Project settings (gear icon) → General →
   "Your apps" → Web app → SDK setup and configuration
   ============================================================ */

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Main app — tracks whoever is currently logged in on this page.
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
