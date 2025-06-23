import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const sectionTitles = ["ユーザ管理", "物品管理", "カテゴリ管理"] as const;
type SectionTitle = typeof sectionTitles[number]; 

const routes: Record<SectionTitle, { add: string; edit: string }> = {
  "ユーザ管理": { add: "/admin/add-user", edit: "/list_user" },
  "物品管理": { add: "/admin/add-equipment", edit: "/list_equipment" },
  "カテゴリ管理": { add: "/admin/add-category", edit: "/list_category" },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions?status=request`, {
        withCredentials: true,
      });
      setRequests(res.data);
    } catch (err) {
      console.error("申請取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id: number, decision: "approved" | "rejected") => {
    try {
      await axios.patch(
        `${API_URL}/transactions/${id}?status=${decision}`,
        null,
        { withCredentials: true }
      );
      fetchRequests(); // 再読み込みして一覧から消す
    } catch (error) {
      console.error(`申請${decision}エラー:`, error);
    }
  };

  const handleRequestClick = (tx: any) => {
    const name = tx.item?.name ?? "不明な物品";
    const confirmMsg = `「${name}」を承認しますか？`;
    if (confirm(confirmMsg)) {
      handleDecision(tx.id, "approved");
    } else if (confirm("申請を却下しますか？")) {
      handleDecision(tx.id, "rejected");
    }
  };

  const TableHeader = ({ headers }: { headers: string[] }) => (
    <Flex
      px={4}
      py={2}
      bg="gray.200"
      fontWeight="bold"
      borderTopRadius="md"
      borderBottom="1px solid #ccc"
    >
      {headers.map((header, idx) => (
        <Box key={idx} flex={1} textAlign="center">
          {header}
        </Box>
      ))}
    </Flex>
  );

  const TableRow = ({ columns }: { columns: (string | JSX.Element)[] }) => (
    <Flex
      px={4}
      py={2}
      bg="gray.50"
      borderBottom="1px solid #eee"
      alignItems="center"
    >
      {columns.map((col, idx) => (
        <Box key={idx} flex={1} textAlign="center">
          {col}
        </Box>
      ))}
    </Flex>
  );

  return (
    <Box bg="gray.50" minH="100vh" pt={8} pr={8}>
      <Box mb={6}>
        <Heading size="xl" color="gray.800">Admin</Heading>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        <VStack gap={6} align="stretch">
          {sectionTitles.map((title) => (
            <Box key={title} p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Text fontWeight="bold" mb={2}>{title}</Text>
              <HStack gap={4}>
                <Button bg="teal.500" _hover={{ bg: "teal.600" }} color="white" size="sm"
                  onClick={() => navigate(routes[title].add)}>追加</Button>
                <Button bg="gray.700" _hover={{ bg: "gray.800" }} color="white" size="sm"
                  onClick={() => navigate(routes[title].edit)}>編集</Button>
              </HStack>
            </Box>
          ))}
        </VStack>

        <Box borderWidth="1px" borderRadius="md" overflow="hidden" mb={6}>
          <TableHeader headers={["物品名", "カテゴリ", "申請者", "申請理由"]} />
          {(
            requests.map((tx) => (
              <TableRow
                key={tx.id}
                columns={[
                  <Button
                    variant="link"
                    color="blue.600"
                    onClick={() => handleRequestClick(tx)}
                  >
                    {tx.item?.name ?? "不明"}
                  </Button>,
                  tx.item?.category?.name ?? "未分類",
                  tx.user?.name ?? "不明",
                  tx.reason ?? "-",
                ]}
              />
            ))
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default AdminPage;