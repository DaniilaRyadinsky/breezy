import { create } from "zustand/react";
import { User } from "./types";

type AuthStatus = 'unknown' | 'auth' | 'guest';

interface UserStore {
  status: AuthStatus;
  setAuth: () => void;
  setGuest: () => void;
  user: User | null,
  setUser: (user: User) => void,
  removeUser: () => void
}

export const userStore = create<UserStore>((set) => ({

  status: 'unknown',

  setAuth: () => { console.log('auth'); set({ status: 'auth' }) },

  setGuest: () => {
    console.log('setGuest called')
    set({ status: 'guest' })
  },

  user: null,

  setUser: (user) => {
    set({user: user});
    set({ status: 'auth' }) ;
  },

  removeUser: () => {
    set({user: null}); 
    set({ status: 'guest' })
  },

  //TODO: синхронизировать статус с юзером

  
}));


