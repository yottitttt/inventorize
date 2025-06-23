import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Flex,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

type Equipment = {
  id: number;
  name: string;
  category_id: number | null;
  is_available: boolean;
  location: string | null;
  notes: string | null;
  image_path: string | null;
  registration_date: string;
};

type Category = {
  id: number;
  name: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const EditEquipumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // フォームの状態
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("取得するID:", id);
        
        // 物品データの取得
        const equipmentResponse = await axios.get(`${API_URL}/items/${id}`, {
          withCredentials: true
        });
        console.log("物品データ:", equipmentResponse.data);
        
        // カテゴリデータの取得
        const categoriesResponse = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        
        setEquipment(equipmentResponse.data);
        setCategories(categoriesResponse.data);
        
        // フォームの初期値を設定
        setName(equipmentResponse.data.name || "");
        setCategoryId(equipmentResponse.data.category_id);
        setIsAvailable(equipmentResponse.data.is_available);
        setLocation(equipmentResponse.data.location || "");
        setNotes(equipmentResponse.data.notes || "");
      } catch (error) {
        console.error("データ取得エラー:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setError(`APIエラー: ${error.response.status} - ${error.response.data.detail || "データが見つかりません"}`);
          } else if (error.request) {
            setError("サーバーからの応答がありません。ネットワーク接続を確認してください。");
          } else {
            setError(`リクエストエラー: ${error.message}`);
          }
        } else {
          setError(`予期しないエラー: ${String(error)}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const updateData = {
        name,
        category_id: categoryId,
        is_available: isAvailable,
        location,
        notes
      };
      
      await axios.put(`${API_URL}/items/${id}`, updateData, {
        withCredentials: true
      });
      
      console.log("更新完了");
      navigate("/list_equipment");
    } catch (error) {
      console.error("更新エラー:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(`更新エラー: ${error.response.status} - ${error.response.data.detail || "更新に失敗しました"}`);
        } else if (error.request) {
          setError("サーバーからの応答がありません。ネットワーク接続を確認してください。");
        } else {
          setError(`リクエストエラー: ${error.message}`);
        }
      } else {
        setError(`予期しないエラー: ${String(error)}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>データを読み込んでいます...</Text>
      </Box>
    );
  }

  if (!equipment && !loading) {
    return (
      <Box p={8}>
        <Flex mb={6}>
          <Link 
            as={RouterLink}
            to="/list_equipment"
            fontSize="lg"
            fontWeight="bold"
            color="gray.400"
            textDecoration="underline"
            mr={2}
            _hover={{ color: "blue.500", textDecoration: "underline" }}
          >
            Equipment List
          </Link>
          <Text color="gray.400">/ Error</Text>
        </Flex>
        
        <Text color="red.500" fontSize="lg">対象の物品が見つかりません</Text>
        <Text mt={2}>ID: {id}</Text>
        
        {error && (
          <Box p={4} bg="red.100" color="red.800" borderRadius="md" my={4}>
            {error}
          </Box>
        )}
        
        <Button 
          mt={4} 
          colorScheme="blue" 
          onClick={() => navigate("/list_equipment")}
        >
          物品一覧に戻る
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Flex mb={6}>
        <Link 
          as={RouterLink}
          to="/list_equipment"
          fontSize="lg"
          fontWeight="bold"
          color="gray.400"
          textDecoration="underline"
          mr={2}
          _hover={{ color: "blue.500", textDecoration: "underline" }}
        >
          Equipment List
        </Link>
        <Text color="gray.400">/ Edit Equipment</Text>
      </Flex>
    
      <Heading size="md" mb={6}>
        「{equipment?.name}」を編集
      </Heading>

      {error && (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          {error}
        </Box>
      )}

      <Box maxW="600px">
        <Box mb={4}>
          <Text fontWeight="bold">物品名</Text>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            bg="white"
          />
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>
            分類
          </Text>
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #CBD5E0",
              fontSize: "14px",
            }}
          >
            <option value="">-- 未分類 --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>
            状態
          </Text>
          <select
            value={isAvailable ? "available" : "unavailable"}
            onChange={(e) => setIsAvailable(e.target.value === "available")}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #CBD5E0",
              fontSize: "14px",
            }}
          >
            <option value="available">貸出可能</option>
            <option value="unavailable">貸出中</option>
          </select>
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold">保管場所</Text>
          <Input 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            bg="white"
          />
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold">備考</Text>
          <Input 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            bg="white"
          />
        </Box>

        <Flex gap={4}>
          <Button
            bg="green.500"
            color="white"
            _hover={{ bg: "green.600" }}
            onClick={handleUpdate}
            isLoading={saving}
            loadingText="更新中..."
          >
            更新
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/list_equipment")}
          >
            キャンセル
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default EditEquipumentPage;
