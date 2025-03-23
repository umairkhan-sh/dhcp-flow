import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setIsAuthenticated: (value) =>
        set(() => ({
          isAuthenticated: value
        })),
    }),
    {
      name: "auth-store", 
    }
  ) 
);
