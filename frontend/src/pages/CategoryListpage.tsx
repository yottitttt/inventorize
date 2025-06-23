import { Box, Text, Spinner, Button, Input, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// カテゴリの型定義
type Category = {
  id: number;
  name: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const CategoryListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // カテゴリデータを取得
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        setCategories(response.data);
        setFilteredCategories(response.data);
      } catch (error) {
        console.error("カテゴリ取得エラー:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setError(`APIエラー: ${error.response.status} - ${error.response.data.detail || "カテゴリの取得に失敗しました"}`);
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
    
    fetchCategories();
  }, []);

  // 検索フィルター
  useEffect(() => {
    const results = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(results);
    setCurrentPage(1); // 検索時は1ページ目に戻る
  }, [searchTerm, categories]);

  // ページネーション
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>カテゴリデータを読み込んでいます...</Text>
      </Box>
    );
  }

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
          <Text color="gray.400">/ Category List</Text>
      </Flex>

      <Text fontSize="xl" fontWeight="bold" mb={4}>カテゴリ一覧</Text>
      
      {error && (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          {error}
        </Box>
      )}

      {/* 検索バー */}
      <Box display="flex" gap={4} mb={6} alignItems="center">
        <Input
          placeholder="カテゴリ名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="300px"
          bg="white"
        />
      </Box>

      <Box overflowX="auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#4299e1", color: "white" }}>
            <tr>
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>カテゴリ名</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((category) => (
              <tr key={category.id}>
                <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                  <Link
                    as={RouterLink}
                    to={`/edit_category/${category.id}`}
                    style={{ color: "#3182ce", textDecoration: "underline" }}
                  >
                    {category.name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* ページネーション */}
      {totalPages > 1 && (
        <Box mt={6}>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              color="black"
              bg={currentPage === index + 1 ? "gray.400" : "gray.300"}
              _hover={{ bg: "gray.400" }}
              size="sm"
              mx={1}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CategoryListPage;
