import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });

        // 管理者判定
        if (res.data.is_admin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("認証チェック失敗:", error);
        setIsAdmin(false); // 認証失敗は非管理者と同じ扱い
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <div>認証確認中...</div>;

  // 管理者でない場合はログインページへ
  if (!isAdmin) return null;

  // 管理者なら対象ページを表示
  return children;
};

export default AdminProtectedRoute;
