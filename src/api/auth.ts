import { app } from "../firebase/firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import type { User } from "firebase/auth";

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOutUser = (): Promise<void> => {
  return signOut(auth);
};

export const onAuthChangeListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
