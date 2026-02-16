// Firebase Configuration
// For development, you can use the config object directly
// For production, use environment variables

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Your Firebase project credentials
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRQbpuil__qK5GvoeMw9LaBtRu3I6nIn4",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "student-exit-entry.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "student-exit-entry",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "student-exit-entry.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "726701193471",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:726701193471:web:6f1019f7986fd258a7b4ca",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ETJDS38591"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

export { app, db };
