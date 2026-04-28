import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const persist = (t, u) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t); setUser(u);
  };

  // role = "admin" | "officer" | "user" — sent to backend so it knows which auth path to use
  const login = async (email, password, badgeNumber, role = "user") => {
    setLoading(true);
    try {
      const payload = { email, role };
      if (badgeNumber) payload.badgeNumber = badgeNumber;
      if (password)    payload.password    = password;
      const res = await API.post("/auth/login", payload);
      persist(res.data.token, res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Registration is for users only — role is always "user"
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      persist(res.data.token, res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null); setUser(null);
  };

  useEffect(() => {
    if (!token) return;
    API.get("/auth/profile")
      .then((res) => {
        const u = res.data.data;
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      })
      .catch(logout);
  }, [token]);

  const isAdmin          = user?.role === "admin";
  const isOfficer        = user?.role === "officer";
  const isOfficerOrAdmin = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isOfficer, isOfficerOrAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
