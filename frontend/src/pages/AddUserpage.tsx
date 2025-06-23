import {
    Box,
    Button,
    Heading,
    Input,
    Text,
    Flex,
    Link,
  } from "@chakra-ui/react";
  import { useNavigate, Link as RouterLink } from "react-router-dom";
  import { useState } from "react";
  import axios from "axios";

  const API_URL = import.meta.env.VITE_API_URL;
  
  const AddUserPage = () => {
    const [formData, setFormData] = useState({
      name: "",
      grade: "",
      email: "",
      password: "",
      is_admin: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // 入力フィールドの変更を処理する関数
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value
      });
    };
  
    const handleAdd = async () => {
      setError("");
      setSuccess(false);

      // バリデーション
      if (!formData.name.trim()) {
        setError("名前を入力してください");
        return;
      }
      if (!formData.grade.trim()) {
        setError("学年を選択してください");
        return;
      }
      if (!formData.email.trim()) {
        setError("メールアドレスを入力してください");
        return;
      }
      if (!formData.password.trim()) {
        setError("パスワードを入力してください");
        return;
      }

      setIsLoading(true);

      try {
        await axios.post(
          `${API_URL}/users/`,
          {
            name: formData.name,
            grade: formData.grade,  // 学年をそのまま送信
            email: formData.email,
            password: formData.password,
            is_admin: formData.is_admin
          },
          {
            withCredentials: true
          }
        );

        setSuccess(true);
        console.log("ユーザー追加完了");

        // 入力フィールドをクリア
        setFormData({
          name: "",
          grade: "",
          email: "",
          password: "",
          is_admin: false
        });

        // 3秒後に成功メッセージを消す
        setTimeout(() => {
          setSuccess(false);
        }, 3000);

      } catch (error) {
        console.error("ユーザー追加エラー:", error);

        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.log("エラーレスポンス:", error.response);
            setError(error.response.data.detail || "ユーザーの追加に失敗しました");
          } else if (error.request) {
            setError("サーバーに接続できませんでした。ネットワーク接続を確認してください。");
          } else {
            setError("リクエストの設定中にエラーが発生しました。");
          }
        } else {
          setError("予期しないエラーが発生しました。");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 学年の選択肢
    const gradeOptions = [
      { value: "", label: "学年を選択" },
      { value: "U4", label: "U4" },
      { value: "M1", label: "M1" },
      { value: "M2", label: "M2" },
      { value: "OB_OG", label: "OB_OG" },
    ];
  
    return (
      <Box p={8}>
        <Flex mb={6}>
          <Link
            as={RouterLink}
            to="/admin"
            fontSize="lg"
            fontWeight="bold"
            color="gray.400"
            textDecoration="underline"
            mr={2}
            _hover={{ color: "blue.500", textDecoration: "underline" }}
          >
            Admin
          </Link>
          <Text color="gray.400">/ Add User</Text>
        </Flex>
  
        <Heading as="h2" size="md" mb={6}>
          以下の項目を入力してください。
        </Heading>
  
        <Box maxW="600px">
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>名前：</Text>
            <Input 
              name="name"
              placeholder="氏名を入力" 
              value={formData.name}
              onChange={handleInputChange}
              bg="white"
            />
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>学年：</Text>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #CBD5E0",
                backgroundColor: "white",
                fontSize: "1rem",
              }}
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>Email：</Text>
            <Input 
              name="email"
              placeholder="メールアドレスを入力" 
              value={formData.email}
              onChange={handleInputChange}
              bg="white"
            />
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>Password：</Text>
            <Input 
              name="password"
              type="password" 
              placeholder="パスワードを入力" 
              value={formData.password}
              onChange={handleInputChange}
              bg="white"
            />
          </Box>
  
          <Box mb={4}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input 
                type="checkbox" 
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleInputChange}
                style={{ marginRight: "8px" }} 
              />
              Adminユーザ
            </label>
          </Box>
  
          <Button
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            onClick={handleAdd}
            isLoading={isLoading}
            loadingText="追加中..."
            isDisabled={isLoading}
            mb={4}
          >
            追加
          </Button>
        </Box>
  
        {/* エラーメッセージ */}
        {error && (
          <Box p={3} bg="red.100" color="red.800" borderRadius="md" mb={4}>
            {error}
          </Box>
        )}
  
        {/* 成功メッセージ */}
        {success && (
          <Box p={3} bg="green.100" color="green.800" borderRadius="md" mb={4}>
            ユーザーが正常に追加されました。
          </Box>
        )}
      </Box>
    );
  };
  
  export default AddUserPage;
  