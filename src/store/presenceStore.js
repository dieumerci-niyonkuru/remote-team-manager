import { create } from 'zustand';

export const usePresenceStore = create((set) => ({
  onlineUsers: [],
  status: 'closed',
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setStatus: (status) => set({ status }),
}));
