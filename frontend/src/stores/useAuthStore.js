import { create } from "zustand";
import axios from "../lib/axios";
import toast  from "react-hot-toast";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password doesn't match");
    }
    try {
      const response = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },
  login: async (email, password) => {
    set({ loading: true });

    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });
      console.log("user is here", response.data);
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await axios.post("/auth/logout");
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "Something went wrong");
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/getProfile");
      set({ user: res.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false });
    }
  },
}));

export default useAuthStore;
