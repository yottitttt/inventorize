import { Box, Heading, Input, Button, Spinner } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// 物品の型定義
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

const EquipumentsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // ページネーション
  const currentItems = filteredEquipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);

  return (
    <Box p={8}>
      <Box mb={8}>
        <Heading mb={4}>Equipuments（物品管理）ページ</Heading>
        <p>アイテムの情報を表示します</p>
      </Box>
      
      {/* 検索とフィルター */}
      <Box display="flex" gap={4} mb={6} alignItems="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
        <Input
          placeholder="物品名で検索"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          flex="1"
          bg="white"
        />
        
        <Box>
          <select
            value={categoryFilter === null ? "" : categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value === "" ? null : Number(e.target.value));
              setCurrentPage(1);
            }}
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
              setCurrentPage(1);
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
      </Box>

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
        <>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>物品名</Table.ColumnHeader>
                <Table.ColumnHeader>カテゴリ</Table.ColumnHeader>
                <Table.ColumnHeader>状態</Table.ColumnHeader>
                <Table.ColumnHeader>保管場所</Table.ColumnHeader>
                <Table.ColumnHeader>登録日</Table.ColumnHeader>
                <Table.ColumnHeader>備考</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredEquipments.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                    該当する物品がありません
                  </Table.Cell>
                </Table.Row>
              ) : (
                currentItems.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Link
                        to={`/equipuments/${item.id}`}
                        style={{ color: "#3182ce", textDecoration: "underline" }}
                      >
                        {item.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {item.category?.name || "未分類"}
                    </Table.Cell>
                    <Table.Cell color={item.is_available ? "green.500" : "red.500"}>
                      {item.is_available ? "貸出可能" : "貸出中"}
                    </Table.Cell>
                    <Table.Cell>
                      {item.location || "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(item.registration_date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      {item.notes || "-"}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

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
        </>
      )}
    </Box>
  );
};

export default EquipumentsPage;