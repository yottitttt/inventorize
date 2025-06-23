import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Flex,
  Text,
  HStack,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(""); // ← ここは選択ボタンで設定
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !grade || !email || !password) {
      alert("すべての項目を入力してください");
      return;
    }

    const userData = {
      name,
      email,
      password,
      grade,
    };

    try {
      const res = await axios.post(`${API_URL}/users/`, userData);

      alert(`サインアップ成功．ようこそ、${res.data.name} さん`);
      navigate("/login");
    } catch (error: any) {
      if (error.response?.data?.detail) {
        alert(`サインアップ失敗: ${error.response.data.detail}`);
      } else {
        alert("通信エラー: " + error.message);
      }
    }
  };

  return (
    <Flex width="100vw" height="100vh" justify="center" align="center" bg="gray.700">
      <Box p={10} bg="gray.800" borderRadius="md" boxShadow="2xl" w="full" maxW="400px">
        <Heading mb={6} textAlign="center" fontSize="2xl" color="teal.200">
          サインアップ
        </Heading>
        <form onSubmit={handleSignUp}>
          <VStack spacing={4}>
            <Input
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg="gray.600"
              color="white"
              _placeholder={{ color: "gray.300" }}
            />
            <Box w="full">
              <Text mb={2} color="gray.200">学年を選択：</Text>
              <HStack spacing={3} wrap="wrap">
              {["U4", "M1", "M2", "OB_OG"].map((level) => (
              <Button
                key={level}
                onClick={() => setGrade(level)}
                colorScheme={grade === level ? "blue" : "blue"}
                variant={grade === level ? "solid" : "outline"}
                size="sm"
                color={grade === level ? "black" : "black."} 
              >
                {level}
              </Button>
            ))}

              </HStack>
            </Box>
            <Input
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.600"
              color="white"
              _placeholder={{ color: "gray.300" }}
            />
            <Input
              placeholder="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.600"
              color="white"
              _placeholder={{ color: "gray.300" }}
            />
            <Button
              type="submit"
              bg="blue.400"
              _hover={{ bg: "blue.500" }}
              color="white"
              w="full"
            >
              登録
            </Button>
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.300">
                ログインは{" "}
                <Link color="teal.300" onClick={() => navigate("/login")}>
                  こちら
                </Link>
              </Text>
            </Box>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default SignUpPage;
