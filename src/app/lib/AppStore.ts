import { create } from "zustand";


interface AppState {
  isSidebarOpen: boolean,
  openSidebar: () => void,
  closeSidebar: () => void,
  setSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({isSidebarOpen: false}),

  setSidebar: () => set((state)=> ({isSidebarOpen: !state.isSidebarOpen}))
}))