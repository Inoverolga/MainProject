import { useState, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:3001";
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setAuthUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAuthUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAuthUser(null);
    navigate("/");
  };

  const openOAuthPopup = (provider) => {
    window.open(
      `${API_BASE}/api/auth/${provider}`,
      "AuthPopup",
      "width=500,height=400"
    );
  };

  const value = {
    authUser,
    login,
    logout,
    loading,
    isAuthenticated: !!authUser,
    setLoading,
    openOAuthPopup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
