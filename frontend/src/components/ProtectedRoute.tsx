import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // 認証確認中（ローディング）
    return <p>認証確認中...</p>;
  }

  if (!isAuthenticated) {
    // 未認証
    return null;
  }

  // 認証済み → children を表示
  return children;
};

export default ProtectedRoute;