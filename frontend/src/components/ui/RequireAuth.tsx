import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = document.cookie.includes("access_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      alert("ログインが必要です");
      navigate("/login");
    }
  }, [navigate]);

  return children;
};

export default RequireAuth;
