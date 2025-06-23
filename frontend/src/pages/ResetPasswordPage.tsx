import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("すべての項目を入力してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    try {
      await axios.post(`${API_URL}/reset-password`, {
        token,
        new_password: newPassword,
      });
      alert("パスワードがリセットされました。ログインしてください。");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "リセットに失敗しました。");
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" pt={8} px={8}>
      <Box mb={6}>
        <Heading size="xl" color="gray.800">
          パスワード再設定
        </Heading>
      </Box>

      <Box p={0} bg="transparent" boxShadow="none" maxW="800px" w="100%">
        <Text fontSize="lg" fontWeight="bold" mb={6}>
          新しいパスワードを入力してください。
        </Text>

        {error && <Text color="red.500" mb={3}>{error}</Text>}

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <Input
              placeholder="新しいパスワード"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="lg"
            />
            <Input
              placeholder="新しいパスワード（確認用）"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="lg"
            />
            <Button
              type="submit"
              bg="blue.500"
              _hover={{ bg: "blue.600" }}
              color="white"
              w="full"
              fontWeight="bold"
              size="lg"
              mt={2}
              isDisabled={!token}
            >
              変更
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
