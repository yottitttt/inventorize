import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ★ 追加

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null); // ★ エラーメッセージ用
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post(`${API_URL}/forgot-password`, null, {
        params: { email },
        withCredentials: true,
      });
      setSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "送信に失敗しました。");
    }
  };

  return (
    <Box p={8}>
      <Heading size="md" mb={6}>パスワード再設定</Heading>
      {sent ? (
        <Text color="green.500">
          再設定用リンクを {email} に送信しました。
        </Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              placeholder="登録済みのメールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              bg="teal.400"
              _hover={{ bg: "teal.500" }}
              color="white"
            >
              メールを送信
            </Button>
            <Button variant="link" onClick={() => navigate("/login")}>
              ログインに戻る
            </Button>
            {error && <Text color="red.500">{error}</Text>} {/* ★ エラー表示 */}
          </VStack>
        </form>
      )}
    </Box>
  );
};

export default ForgotPasswordPage;
