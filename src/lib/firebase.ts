// NOT USED by the site (2026-09-27): nothing imports this file. Its config is
// a template placeholder. See the warning at the top of
// src/components/FirebaseInitializer.tsx before connecting a real project.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
