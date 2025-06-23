import {
    Box,
    Button,
    Heading,
    Input,
    Text,
    Flex,
    Link,
    Spinner,
  } from "@chakra-ui/react";
  import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
  import { useState, useEffect } from "react";
  import axios from "axios";

  const API_URL = import.meta.env.VITE_API_URL;
  
  type Category = {
    id: number;
    name: string;
  };
  
  
  const EditCategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // カテゴリデータを取得
    useEffect(() => {
      const fetchCategory = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/categories/${id}`, {
            withCredentials: true
          });
          setCategory(response.data);
          setCategoryName(response.data.name);
        } catch (error) {
          console.error("カテゴリ取得エラー:", error);
          
          if (axios.isAxiosError(error)) {
            if (error.response) {
              setError(`APIエラー: ${error.response.status} - ${error.response.data.detail || "カテゴリが見つかりません"}`);
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
        fetchCategory();
      }
    }, [id]);
  
    const handleUpdate = async () => {
      if (!id) return;
      if (!categoryName.trim()) {
        setError("カテゴリ名を入力してください");
        return;
      };

      setSaving(true);
      setError(null);

      try {
        await axios.put(
          `${API_URL}/categories/${id}`, 
          { 
            name: categoryName
            // update_itemsフィールドは不要なので削除
          },
          { withCredentials: true }
        );
        
        setSuccess(true);
        
        // 3秒後に成功メッセージを消して、リストページに戻る
        setTimeout(() => {
          navigate("/list_category");
        }, 1500);
        
      } catch (error) {
        console.error("カテゴリ更新エラー:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setError(`更新エラー: ${error.response.status} - ${error.response.data.detail || "カテゴリの更新に失敗しました"}`);
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
    }
  
    if (loading) {
      return (
        <Box p={8} textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>データを読み込んでいます...</Text>
        </Box>
      );
    }
  
    if (!category && !loading) {
      return (
        <Box p={8}>
          <Text color="red.500">対象のカテゴリが見つかりません</Text>
          {error && (
            <Box p={4} bg="red.100" color="red.800" borderRadius="md" mt={4}>
              {error}
            </Box>
          )}
          <Button 
            mt={4} 
            colorScheme="blue" 
            onClick={() => navigate("/list_category")}
          >
            カテゴリ一覧に戻る
          </Button>
        </Box>
      );
    }
  
    return (
      <Box p={8}>
        <Flex mb={6}>
          <Link 
            as={RouterLink}
            to="/list_category"
            fontSize="lg"
            fontWeight="bold"
            color="gray.400"
            textDecoration="underline"
            mr={2}
            _hover={{ color: "blue.500", textDecoration: "underline" }}
          >
            Category List
          </Link>
          <Text color="gray.400">/ Edit Category</Text>
        </Flex>
  
        <Heading size="md" mb={6}>「{category?.name}」を編集</Heading>
  
        <Box maxW="600px">
          {error && (
            <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
              {error}
            </Box>
          )}
          
          {success && (
            <Box p={4} bg="green.100" color="green.800" borderRadius="md" mb={4}>
              カテゴリが正常に更新されました。リダイレクトします...
            </Box>
          )}
  
          <Box mb={4}>
            <Text fontWeight="bold">カテゴリ名</Text>
            <Input 
              value={categoryName} 
              onChange={(e) => setCategoryName(e.target.value)}
              isDisabled={saving}
              bg="white"
            />
          </Box>
          
          <Box mb={4}>
            <Text fontSize="sm" color="gray.500" mt={1}>
              このカテゴリ名を変更すると、関連するすべての物品も自動的に更新されます。
            </Text>
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
              onClick={() => navigate("/list_category")}
              isDisabled={saving}
            >
              キャンセル
            </Button>
          </Flex>
        </Box>
      </Box>
    );

};
export default EditCategoryPage;