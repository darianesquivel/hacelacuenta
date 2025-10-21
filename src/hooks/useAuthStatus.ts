import { useAuthStore } from "../store/authStore";

export const useAuthStatus = () => {
  const { currentUser, isLoading } = useAuthStore();

  return {
    currentUser,
    isLoading,
  };
};
