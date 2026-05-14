import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Secondary app — faqat yangi foydalanuvchi yaratish uchun (admin sessionini buzmaslik uchun)
export const secondaryApp = hasFirebaseConfig ? initializeApp(firebaseConfig, "secondary") : null;
export const secondaryAuth = secondaryApp ? getAuth(secondaryApp) : null;
export const secondaryDb = secondaryApp ? getFirestore(secondaryApp) : null;
export const analyticsPromise = app ? isSupported().then((supported) => (supported ? getAnalytics(app) : null)) : Promise.resolve(null);

export async function ensureAdminSession() {
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser;

  // Auth state hali tiklanmagan bo'lishi mumkin — tayyor bo'lgunicha kutamiz
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Login qilinmagan. Avval tizimga kiring."));
    });
  });
}
