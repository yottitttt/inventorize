import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

interface Transaction {
  id: number;
  name: string;
  transaction_date: string;
  status: string;
}

interface Rental {
  id: number;
  name: string;
  return_deadline: string;
}

interface History {
  id: number;
  name: string;
  returned_date: string;
}

const API_URL = import.meta.env.VITE_API_URL;

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
  <Flex px={4} py={2} bg="gray.50" borderBottom="1px solid #eee" alignItems="center">
    {columns.map((col, idx) => (
      <Box key={idx} flex={1} textAlign="center">
        {col}
      </Box>
    ))}
  </Flex>
);

const MylistPage = () => {
  const location = useLocation();
  const newItem = location.state as Transaction | undefined;
  const [items, setItems] = useState<Transaction[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("ユーザー情報が見つかりません。ログインし直してください。");
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/transactions/`, {
        params: { user_id: userId, status: "request" },
        withCredentials: true,
      });
      let transactions: Transaction[] = res.data;
      if (newItem && !transactions.find((item) => item.id === newItem.id)) {
        transactions = [...transactions, newItem];
      }
      setItems(transactions);

      const rentalRes = await axios.get(`${API_URL}/transactions/`, {
        params: { user_id: userId, status: "approved" },
        withCredentials: true,
      });
      setRentals(
        rentalRes.data.map((t: any) => ({
          id: t.id,
          name: t.item?.name,
          return_deadline: t.return_deadline,
        }))
      );

      const historyRes = await axios.get(`${API_URL}/transactions/`, {
        params: { user_id: userId, status: "returned" },
        withCredentials: true,
      });
      setHistory(
        historyRes.data.map((h: any) => ({
          id: h.id,
          item: h.item,
          returned_date: h.returned_date,
        }))
      );
    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.response?.data?.detail || "データの取得に失敗しました。");
    }
  };

  useEffect(() => {
    fetchData();
  }, [newItem]);

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm("本当にキャンセルしてもよろしいですか？");
    if (!confirmed) return;

    try {
      await axios.post(`${API_URL}/cancel/${id}`, {}, {
        withCredentials: true,
      });

      // 状態を再取得することで UI も更新
      fetchData();
    } catch (err) {
      alert("キャンセルに失敗しました。");
      console.error("キャンセルエラー:", err);
    }
  };

  const handleReturn = async (transactionId: number) => {
    const confirmed = window.confirm("この物品を返却しますか？");
    if (!confirmed) return;

    try {
      await axios.post(
        `${API_URL}/return/${transactionId}`,
        {},
        { withCredentials: true }
      );
      setRentals((prev) => prev.filter((r) => r.id !== transactionId));
      alert("返却が完了しました。");
      fetchData();
    } catch (err) {
      alert("返却に失敗しました。");
      console.error("返却エラー:", err);
    }
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Mylistページ</Heading>
      {error && <Text color="red.500">{error}</Text>}

      {/* 申請中の物品 */}
      <Heading size="md" mt={6} mb={1}>申請中の物品</Heading>
      {items.length === 0 && <Text mb={2}>申請中の物品はありません。</Text>}
      <Box borderWidth="1px" borderRadius="md" overflow="hidden" mb={6}>
        <TableHeader headers={["名前", "申請日", /*"状態",*/ "操作"]} />
        {items.length === 0 ? (
          <TableRow columns={["-", "-", /*"-",*/ "-"]} />
        ) : (
          items.map((item) => (
            <TableRow
              key={item.id}
              columns={[
                item.item?.name ?? "不明",
                new Date(item.transaction_date).toLocaleDateString(),
                // item.status,
                item.status === "request" ? (
                  <Button size="sm" bg="red.500" colorScheme="red" onClick={() => handleCancel(item.id)}>
                    キャンセル
                  </Button>
                ) : (
                  "-"
                ),
              ]}
            />
          ))
        )}
      </Box>

      {/* 借用中の物品 */}
      <Heading size="md" mt={6} mb={1}>借用中の物品</Heading>
      {rentals.length === 0 && <Text mb={2}>借用中の物品はありません。</Text>}
      <Box borderWidth="1px" borderRadius="md" overflow="hidden" mb={6}>
        <TableHeader headers={["名前", /*"返却期限",*/ "操作"]} />
        {rentals.length === 0 ? (
          <TableRow columns={["-", /*"-",*/ "-"]} />
        ) : (
          rentals.map((rental) => (
            <TableRow
              key={rental.id}
              columns={[
                rental.name,
                // new Date(rental.return_deadline).toLocaleDateString(),
                <Button size="sm" bg="blue.500" colorScheme="blue" onClick={() => handleReturn(rental.id)}>
                  返却
                </Button>,
              ]}
            />
          ))
        )}
      </Box>

      {/* 使用履歴
      <Heading size="md" mt={6} mb={1}>過去の使用履歴</Heading>
      {history.length === 0 && <Text mb={2}>履歴がまだありません。</Text>}
      <Box borderWidth="1px" borderRadius="md" overflow="hidden">
        <TableHeader headers={["名前", "返却日"]} />
        {history.length === 0 ? (
          <TableRow columns={["-", "-"]} />
        ) : (
          history.map((record) => (
            <TableRow
              key={record.id}
              columns={[
                record.item?.name ?? "不明",
                new Date(record.returned_date).toLocaleDateString(),
              ]}
            />
          ))
        )}
      </Box> */}
    </Box>
  );
};

export default MylistPage;
