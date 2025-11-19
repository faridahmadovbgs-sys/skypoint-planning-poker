// Firebase configuration for SkyPoint Planning Poker
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDJR0NHTogRU3z34uzAMhNS29Bb37gpnOI",
  authDomain: "skypoint-3a325.firebaseapp.com",
  databaseURL: "https://skypoint-3a325-default-rtdb.firebaseio.com/",
  projectId: "skypoint-3a325",
  storageBucket: "skypoint-3a325.firebasestorage.app",
  messagingSenderId: "55508220520",
  appId: "1:55508220520:web:f2417b217e5d58576759dd",
  measurementId: "G-WLTWSXWJX1"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error.message);
  console.log('Multi-user functionality will use demo mode');
}

export { database };
export default app;