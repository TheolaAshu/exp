const { initializeApp } = require ("firebase/app");

// Initialize Firebase App
const firebaseConfig = {
    apiKey: "AIzaSyDY0eHzN5AWUP8DxQb8jhZ9TtEtsj57ZOo",
  authDomain: "t-scripty.firebaseapp.com",
  projectId: "t-scripty",
  storageBucket: "t-scripty.appspot.com",
  messagingSenderId: "468422233143",
  appId: "1:468422233143:web:32ad45d8752ac3b52c83b2",
  measurementId: "G-TX0NECQ4MB"
};
const firebaseApp = initializeApp(firebaseConfig);

module.exports={firebaseApp}

