import { create } from "zustand/react";
import { User } from "./types";

interface UserStore {
  user: User | null,
  setUser: (user: User) => void,
  removeUser: () => void
}

export const userStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({user: user}),
  removeUser: () => set({user: null})
}));
