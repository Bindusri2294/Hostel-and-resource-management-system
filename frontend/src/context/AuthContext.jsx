import { createContext, useContext, useState, useEffect } from "react";
import { getMe, login as loginApi, register as registerApi } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userId, password) => {
    const res = await loginApi(userId, password);
    const { token, ...userData } = res.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return userData;
  };

  const register = async (signupData) => {
    const res = await registerApi(signupData);
    const { token, ...userData } = res.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}