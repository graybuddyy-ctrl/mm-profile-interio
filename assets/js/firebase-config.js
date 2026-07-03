// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsvfYErgcMvgU7-o649xjwgn4h0pvVzBk",
  authDomain: "mm-profile-interio.firebaseapp.com",
  databaseURL: "https://mm-profile-interio-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mm-profile-interio",
  storageBucket: "mm-profile-interio.firebasestorage.app",
  messagingSenderId: "372821940290",
  appId: "1:372821940290:web:5eed2698f717443340b5db",
  measurementId: "G-L57MBRY7TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
