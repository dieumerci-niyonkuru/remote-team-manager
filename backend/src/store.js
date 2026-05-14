import { create } from "zustand";

export const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) { localStorage.setItem("token", token); }
    else { localStorage.removeItem("token"); }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
  team: [],
  setTeam: (team) => set({ team }),
}));
