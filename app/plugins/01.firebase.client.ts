import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const firebaseConfig = config.public.firebase;
  try {
    // Check if Firebase app already exists to avoid re-initialization
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase services
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);

    // Connect to emulators in development (if needed)
    if (process.dev && typeof window !== 'undefined') {
      // Uncomment these lines if you're using Firebase emulators in development
      // if (!auth._delegate._config.emulator) {
      //   connectAuthEmulator(auth, 'http://localhost:9099');
      // }
      // if (!db._delegate._databaseId.projectId.includes('demo-')) {
      //   connectFirestoreEmulator(db, 'localhost', 8080);
      // }
    }

    // Make services available globally
    return {
      provide: {
        firebase: app,
        db,
        auth,
        storage
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    // Don't throw error in production to prevent app crash
    if (process.dev) {
      throw error;
    }
    return {
      provide: {
        firebase: null,
        db: null,
        auth: null,
        storage: null
      }
    }
  }
})