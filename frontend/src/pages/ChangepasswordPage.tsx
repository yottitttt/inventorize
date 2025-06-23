import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("すべての項目を入力してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("新しいパスワードが一致しません。");
      return;
    }

    try {
      await axios.post(`${API_URL}/change-password`, {
        current_password: oldPassword,
        new_password: newPassword,
      }, { withCredentials: true });

      alert("パスワードが変更されました。");
    } catch (err: any) {
      alert(err.response?.data?.detail || "パスワード変更に失敗しました。");
    }
  };


  return (
    <Box bg="gray.50" minH="100vh" pt={8} pr={8}>
      {/* タイトル部分 */}
      <Box mb={6}>
        <Heading size="xl" color="gray.800">
          Change Password
        </Heading>
      </Box>

      {/* フォーム部分（枠なし） */}
      <Box
        p={0}
        bg="transparent"
        boxShadow="none"
        maxW="800px"
        w="100%"
      >
        <Text fontSize="lg" fontWeight="bold" mb={6}>
          以下の項目を入力してください。
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <Input
              placeholder="元のパスワード"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              size="lg"
            />
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
            >
              変更
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
