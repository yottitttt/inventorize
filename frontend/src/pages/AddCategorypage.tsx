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
  import {useState} from "react";
  import axios from "axios";

  const API_URL = import.meta.env.VITE_API_URL;
  
  const AddCategoryPage = () => {
    const [categoryName, setCategoryName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
  
    const handleAdd = async () => {
      setError("");
      setSuccess(false);
      console.log("API URL:", import.meta.env.VITE_API_URL);

      if(!categoryName.trim()) {
        setError("カテゴリー名を入力してください");
        return;
      }

      setIsLoading(true);

      try{
        await axios.post(
          `${API_URL}/categories/`, 
        { name: categoryName },
        { 
          withCredentials: true // クッキーを含める（認証のため）
        }
        )

        setSuccess(true);
        console.log("カテゴリー追加完了");
        
        // 入力フィールドをクリアして、次のカテゴリを追加できるようにする
        setCategoryName("");

        // 3秒後に成功メッセージを消す
        setTimeout(() => {
          setSuccess(false);
        }, 3000);

      } catch (error){
        console.error("カテゴリー追加エラー:", error);

        // 一意性制約違反エラーを検出（Axiosのエラーレスポンスから詳細を取得）
        // エラーメッセージの取得
        if (error.response) {
          // サーバーからのエラーレスポンス
          console.log("エラーレスポンス:", error.response);
          setError(error.response.data.detail || "カテゴリーの追加に失敗しました");
        } else if (error.request) {
          // リクエストは送信されたがレスポンスがない（ネットワークエラーなど）
          setError("サーバーに接続できませんでした。ネットワーク接続を確認してください。");
        } else {
          // リクエスト設定時のエラー
          setError("リクエストの設定中にエラーが発生しました。");
        }
      } finally{
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
          <Text color="gray.400">/ Add Category</Text>
        </Flex>
  
        <Heading as="h2" size="md" mb={6}>
          以下の項目を入力してください。
        </Heading>
  
        <Box maxW="600px">
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>カテゴリー名：</Text>
            <Input placeholder="カテゴリー名を入力" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} bg="white"/>
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

        {/* エラーメッセージ Alertが使えないためBoxを使用 */}
        {error && (
          <Box p={3} bg="red.100" color="red.800" borderRadius="md" mb={4}>
            {error}
          </Box>
        )}

        {/* 成功メッセージ Alertが使えないためBoxを使用 */}
        {success && (
          <Box p={3} bg="green.100" color="green.800" borderRadius="md" mb={4}>
            カテゴリーが正常に追加されました。
          </Box>
        )}

      </Box>
    );
  };
  
  export default AddCategoryPage;
  