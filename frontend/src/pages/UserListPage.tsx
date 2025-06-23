import { Box, Text, Spinner, Button, Input, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

type User = {
  id: number;
  name: string;
  grade: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/users/`, {
          withCredentials: true
        });
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("ユーザー取得エラー:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setError(`APIエラー: ${error.response.status} - ${error.response.data.detail || "ユーザーの取得に失敗しました"}`);
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
    
    fetchUsers();
  }, []);

  // 検索フィルター
  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1); // 検索時は1ページ目に戻る
  }, [searchTerm, users]);

  // ページネーション
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>ユーザーデータを読み込んでいます...</Text>
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
          <Text color="gray.400">/ User List</Text>
      </Flex>

      <Text fontSize="xl" fontWeight="bold" mb={4}>ユーザー一覧</Text>
      
      {error && (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          {error}
        </Box>
      )}

      {/* 検索バー */}
      <Box display="flex" gap={4} mb={6} alignItems="center">
        <Input
          placeholder="名前・メール・学年で検索"
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
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>名前</th>
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>学年</th>
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>メールアドレス</th>
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>管理者</th>
              <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>登録日</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center", border: "1px solid #E2E8F0" }}>
                  該当するユーザーがありません
                </td>
              </tr>
            ) : (
              currentItems.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                    <Link
                      as={RouterLink}
                      to={`/edit_user/${user.id}`}
                      style={{ color: "#3182ce", textDecoration: "underline" }}
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                    {user.grade}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                    {user.is_admin ? "✔️" : "ー"}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
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

export default UserListPage;
