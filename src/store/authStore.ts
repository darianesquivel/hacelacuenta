import { create } from "zustand";
import type { User } from "firebase/auth";
import {
  signInWithGoogle,
  signOutUser,
  onAuthChangeListener,
} from "../api/auth";

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  setLoading: (loading: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isLoading: true,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),

  signIn: async () => {
    set({ isLoading: true, error: null });
    try {
      await signInWithGoogle();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Error al iniciar sesión con Google",
        isLoading: false,
      });
      console.error(error);
    }
  },

  signOut: async () => {
    await signOutUser();
    set({ currentUser: null, error: null });
  },

  checkAuthState: () => {
    console.warn(
      "checkAuthState llamado. El observador ya está activo globalmente."
    );
  },
}));

onAuthChangeListener((user) => {
  useAuthStore.setState({ currentUser: user, isLoading: false });
});
