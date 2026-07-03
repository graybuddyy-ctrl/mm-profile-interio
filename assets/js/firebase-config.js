/**
 * Firebase Configuration — MM Profile Interio
 * ------------------------------------------------
 * STEP 1: Go to https://console.firebase.google.com
 * STEP 2: Create a project → Add Web App → copy config
 * STEP 3: Enable Realtime Database → set rules to public
 * STEP 4: Replace the values below with YOUR config
 * STEP 5: Set   enabled: true
 */
window.MM_FIREBASE = {
  enabled: false,  // ← Change to true after filling config

  config: {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId:             "YOUR_APP_ID"
  }
};
