import { create } from "zustand";

interface AuthState {
  currentMongoUserId: string | null;
  setUserId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentMongoUserId: null,
  setUserId: (id) => set({ currentMongoUserId: id }),
}));
