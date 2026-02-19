import { create } from "zustand";

type AuthStatus = 'unknown' | 'auth' | 'guest';

interface AuthStore {
  status: AuthStatus;
  setAuth: () => void;
  setGuest: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'guest',
  setAuth: () => { console.log('auth'); set({ status: 'auth' }) },
  setGuest: () => {
    console.log('setGuest called')
    set({ status: 'guest' })
  }
}));