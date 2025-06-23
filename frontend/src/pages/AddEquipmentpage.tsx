import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Flex,
  Link,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// カテゴリの型定義
interface Category {
  id: number;
  name: string;
}

const AddEquipumentPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    location: "",
    notes: "",
    is_available: true
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // カテゴリ一覧を取得する
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        setCategories(response.data);
      } catch (error) {
        console.error("カテゴリー取得エラー:", error);
        setError("カテゴリーの取得に失敗しました");
      }
    };
    fetchCategories();
  }, []);

  // 入力フィールドの変更を処理する関数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAdd = async () => {
    setError("");
    setSuccess(false);

    if (!formData.name.trim()) {
      setError("物品名を入力してください");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${API_URL}/items/`,
        {
          name: formData.name,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          location: formData.location || null,
          notes: formData.notes || null,
          is_available: formData.is_available
        },
        {
          withCredentials: true // クッキーを含める（認証のため）
        }
      );

      setSuccess(true);
      console.log("物品追加完了");

      // 入力フィールドをクリア
      setFormData({
        name: "",
        category_id: "",
        location: "",
        notes: "",
        is_available: true
      });

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("物品追加エラー:", error);

      // エラーメッセージの取得
      if (error.response) {
        // サーバーからのエラーレスポンス
        console.log("エラーレスポンス:", error.response);
        setError(error.response.data.detail || "物品の追加に失敗しました");
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない
        setError("サーバーに接続できませんでした。ネットワーク接続を確認してください。");
      } else {
        // リクエスト設定時のエラー
        setError("リクエストの設定中にエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
    
  };

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
        <Text color="gray.400">/ Add Equipment</Text>
      </Flex>

      <Heading as="h2" size="md" mb={6}>
        以下の項目を入力してください。
      </Heading>

      <Box maxW="600px">
        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>物品名：</Text>
          <Input name="name" placeholder="物品名を入力" value={formData.name} onChange={handleInputChange} bg="white" />
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>分類：</Text>
          {/* ChakraUIのSelect使えなかった */}
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #CBD5E0",
              fontSize: "14px",
            }}
          >
            <option value="">なし</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={1} >保管場所：</Text>
          <Input
            name="location"
            placeholder="保管場所を入力"
            value={formData.location}
            onChange={handleInputChange}
            bg="white"
          />
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>備考：</Text>
          <Textarea
            name="notes"
            placeholder="備考を入力"
            value={formData.notes}
            onChange={handleInputChange}
            bg="white"
          />
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
          物品が正常に追加されました。
        </Box>
      )}

    </Box>
  );
};

export default AddEquipumentPage;
