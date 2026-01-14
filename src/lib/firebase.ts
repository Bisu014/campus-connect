// Firebase Configuration for CampusGrievance Portal
// ================================================
// 
// INSTRUCTIONS: Replace the placeholder values below with your Firebase project credentials.
// 
// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings > General > Your Apps
// 4. Click "Add app" and select Web (</>)
// 5. Register your app and copy the firebaseConfig object
// 6. Paste the values below
//
// ================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ============================================
// 🔥 PASTE YOUR FIREBASE CONFIG HERE 🔥
// ============================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// ============================================

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
