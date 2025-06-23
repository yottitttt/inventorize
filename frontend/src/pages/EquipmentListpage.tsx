import { Box, Text ,Button, Spinner, Input, Flex, Link } from "@chakra-ui/react";
import { Link  as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// 物品の型定義　
// "category?: { name: string };"はnameプロパティがあってもなくてもいい（データ取得時点ではカテゴリ名は存在しないが、後から追加する）
type Equipment = {
  id: number;
  name: string;
  category_id: number | null;
  category?: { name: string };
  is_available: boolean;
  location: string | null;
  notes: string | null;
  registration_date: string;
};

// カテゴリの型定義
type Category = {
  id: number;
  name: string;
};

const API_URL = import.meta.env.VITE_API_URL;

// useStateの<>は「変数がどのデータ型を格納できるか」を指定
const EquipmentListPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 物品データの取得
        const itemsResponse = await axios.get(`${API_URL}/items/`, {
          withCredentials: true
        });
        
        // カテゴリデータの取得
        const categoriesResponse = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        
        // カテゴリ情報を物品データに紐づける
        const categoriesMap = new Map<number, Category>();
        categoriesResponse.data.forEach((category: Category) => {
          categoriesMap.set(category.id, category);
        });
        
        const itemsWithCategory = itemsResponse.data.map((item: Equipment) => ({
          ...item,
          category: item.category_id ? categoriesMap.get(item.category_id) : undefined
        }));
        
        setEquipments(itemsWithCategory);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // フィルター適用後のデータ
  const filteredEquipments = equipments.filter((item) => {
    // 名前で検索
    const nameMatches = searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // カテゴリでフィルター
    const categoryMatches = 
      categoryFilter === null || 
      item.category_id === categoryFilter;
    
    // 利用可能状態でフィルター
    const availabilityMatches = 
      availabilityFilter === null || 
      item.is_available === availabilityFilter;
    
    return nameMatches && categoryMatches && availabilityMatches;
  });

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
          <Text color="gray.400">/ Equipment List</Text>
        </Flex>

      <Text fontSize="xl" mb={4}>物品一覧</Text>
      
      {/* 検索とフィルター */}
      <Flex gap={4} mb={6} flexWrap={{ base: "wrap", md: "nowrap" }}>
        <Input
          placeholder="物品名で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex="1"
          bg="white"
        />
        
        <Box>
          <select
            value={categoryFilter === null ? "" : categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value === "" ? null : Number(e.target.value))}
            style={{
              height: "40px",
              padding: "0 10px",
              borderRadius: "5px",
              minWidth: "150px",
            }}
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Box>
        
        <Box>
          <select
            value={availabilityFilter === null ? "" : availabilityFilter ? "true" : "false"}
            onChange={(e) => {
              if (e.target.value === "") {
                setAvailabilityFilter(null);
              } else {
                setAvailabilityFilter(e.target.value === "true");
              }
            }}
            style={{
              height: "40px",
              padding: "0 10px",
              borderRadius: "5px",
              minWidth: "150px",
            }}
          >
            <option value="">すべての状態</option>
            <option value="true">貸出可能</option>
            <option value="false">貸出中</option>
          </select>
        </Box>
      </Flex>

      {/* エラー表示 */}
      {error && (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          {error}
        </Box>
      )}

      {/* ローディング表示 */}
      {loading ? (
        <Box textAlign="center" p={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#4299e1", color: "white" }}>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>物品名</th>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>カテゴリ</th>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>状態</th>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>保管場所</th>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>登録日</th>
                <th style={{ padding: "8px", border: "1px solid #CBD5E0" }}>備考</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "16px", textAlign: "center", border: "1px solid #E2E8F0" }}>
                    該当する物品がありません
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                      <Link
                        as={RouterLink}
                        to={`/edit_equipment/${item.id}`}
                        style={{ color: "#3182ce", textDecoration: "underline" }}
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                      {item.category?.name || "未分類"}
                    </td>
                    <td 
                      style={{ 
                        padding: "8px", 
                        border: "1px solid #E2E8F0", 
                        color: item.is_available ? "green" : "red" 
                      }}
                    >
                      {item.is_available ? "貸出可能" : "貸出中"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                      {item.location || "-"}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                      {new Date(item.registration_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
};

export default EquipmentListPage;
