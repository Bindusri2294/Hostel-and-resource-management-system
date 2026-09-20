import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("hostel_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("hostel_token")));

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("auth-expired", handleExpired);
    if (localStorage.getItem("hostel_token")) {
      authService.me().then(({ data }) => {
        setUser((current) => ({ ...current, ...data }));
        localStorage.setItem("hostel_user", JSON.stringify({ ...user, ...data }));
      }).catch(() => {
        localStorage.removeItem("hostel_token");
        localStorage.removeItem("hostel_user");
        setUser(null);
      }).finally(() => setLoading(false));
    }
    return () => window.removeEventListener("auth-expired", handleExpired);
  }, []);

  const login = async (identifierOrCredentials, password) => {
    const payload =
      typeof identifierOrCredentials === "string"
        ? { userId: identifierOrCredentials, email: identifierOrCredentials, password }
        : identifierOrCredentials;

    const { data } = await authService.login(payload);
    localStorage.setItem("hostel_token", data.token);
    localStorage.setItem("hostel_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hostel_token");
    localStorage.removeItem("hostel_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);