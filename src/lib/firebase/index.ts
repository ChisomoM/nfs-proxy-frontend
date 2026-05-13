// Firebase utilities - Optional integration
// To remove Firebase integration:
// 1. Delete this file and related Firebase files
// 2. Remove firebase from package.json
// 3. Remove VITE_FIREBASE_* environment variables
// 4. Remove Firebase imports from components that use them

export { default as firebaseApp } from '../firebase';
export { auth, db, storage } from '../firebase';
export * from '../auth/firebaseAuth';
export * from './firestore';
export * from './storage';