import { useNavigate, useParams } from "react-router-dom";
import { Box, Heading, Image, Text, Button, Input, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

//仮データ
/*const equipuments = [
    { id: 1, name: "ノートパソコン", imageUrl: "/images/laptop.jpg", location: "棚A" },
    { id: 2, name: "プロジェクター", imageUrl: "/images/projector.jpg", location: "棚B" },
    { id: 3, name: "HDMIケーブル", imageUrl: "/images/hdmi.jpg", location: "棚C" },
    { id: 4, name: "マウス", imageUrl: "/images/mausu.jpg", location: "棚D" },
    { id: 5, name: "キーボード", imageUrl: "/images/keyboard.jpg", location: "棚E" },
    { id: 6, name: "ディスプレイ", imageUrl: "/images/display.jpg", location: "棚F" },
    { id: 7, name: "Webカメラ", imageUrl: "/images/camera.jpg", location: "棚G" },
    { id: 8, name: "ヘッドセット", imageUrl: "/images/headset.jpg", location: "棚H" },
    { id: 9, name: "スピーカー", imageUrl: "/images/supi-ka-.jpg", location: "棚I" },
    { id: 10, name: "LANケーブル", imageUrl: "/images/lan.jpg", location: "棚J" },
    { id: 11, name: "USBハブ", imageUrl: "/images/usb.jpg", location: "棚K" },
  ];*/
type Item = {
  id: number;
  name: string;
  category_id: number | null;
  category?: { name: string };
  image_path: string;
  is_available: boolean;
  location: string | null;
  notes: string | null;
};

// カテゴリの型定義
type Category = {
  id: number;
  name: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [reason, setReason] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // 編集モードの状態を追加
  const [updatedItem, setUpdatedItem] = useState<Item | null>(null); // 編集した物品情報の状態を保持

  /*useEffect(() => {
    fetch(`http://localhost:8000/items/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setUpdatedItem(data); // 編集用の初期状態として物品情報をセット
        setLoading(false);
      })
      .catch((err) => {
        console.error("詳細情報取得エラー:", err);
        setLoading(false);
      });
  }, [id]);
  */

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 物品データの取得
        const itemsResponse = await axios.get(`${API_URL}/items/${id}`, {
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

        const itemData: Item = itemsResponse.data;
          
        const category = itemData.category_id ? categoriesMap.get(itemData.category_id) : undefined;

        const itemWithCategory = { ...itemData, category };

        setItem(itemWithCategory);
        setUpdatedItem(itemWithCategory);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
      };
      
      fetchData();
    }, [id]);

  const handleBorrow = async () => {
    if (!reason.trim()) {
      alert("理由を入力してください");
      return;
    }
    const user_id = Number(localStorage.getItem("user_id"));
    const token = localStorage.getItem("token"); // 取得方法はあなたの実装に合わせて
    const requestData = {
      user_id,
      item_id: item!.id,
      type: "borrow",
      reason,
      status: "申請中",
    };
    
    const borrowedItem = {
      id: item!.id,
      name: item!.name,
      image_path: `/images/${item!.image_path}`,
      requestDate: requestData,
      status: "承認待ち",
    };

    fetch(`${API_URL}/transactions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then(res => {
        if (!res.ok) throw new Error("借用リクエストに失敗しました");
        alert("借用リクエストを送信しました");
        navigate("/equipuments", { state: borrowedItem });
      })
      .catch(err => console.error(err));
  };

  if(loading) {
    return <Spinner size="xl" />
  }
  if(!item) {
    return <Text>指示された物品が見つかりません</Text>
  }

  return (
    <Box p={8} position="relative">
      {/* リスト風タイトル */}
      <Box mb={8}>
        <Text fontSize="2xl" fontWeight="bold">
          <Box as="span"
            color="gray.400"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={() => navigate("/equipuments")}
          >
            Equipuments
          </Box>
          {" / "}
          <Box as="span">{item.name}</Box>
        </Text>
      </Box>
      
      {/* 画像（クリックで拡大） */}
      {/* <Image src={item.imageUrl || "/images/noImage.jpg"} alt={item.name} boxSize="300px" objectFit="cover" mb={4} cursor="pointer" onClick={() => setIsZoomed(true)} onError={(e) => {(e.target as HTMLImageElement).src = "/images/noImage.jpg"}}/>*/}

      {/* <Text fontSize="lg">保管場所: {item.location}</Text> */}

      <Box display="flex" gap={8} alignItems="flex-start">
        {/* 画像 */}
        <Image
          src={`/images/${item.image_path || "noImage.jpg"}`}
          alt={item.name}
          boxSize="300px"
          objectFit="cover"
          cursor="pointer"
          onClick={() => setIsZoomed(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/noImage.jpg";
          }}
        />

        {/* 情報パネル */}
        <Box flex="1">
        <Text fontSize="lg" mb={2}>
            保管場所: {isEditing ? (
              <Input
                value={updatedItem?.location || ""}
                onChange={(e) => setUpdatedItem({ ...updatedItem!, location: e.target.value })}
                bg="white"
              />
            ) : (
              item.location || "不明"
            )}
          </Text>

          <Text fontSize="lg" mb={2}>
            カテゴリ: {item.category?.name || "未分類"}
          </Text>

          <Text fontSize="lg" mb={2}>
            備考: {isEditing ? (
              <Input
                value={updatedItem?.notes || ""}
                onChange={(e) => setUpdatedItem({ ...updatedItem!, notes: e.target.value })}
                bg="white"
              />
            ) : (
              item.notes || "備考なし"
            )}
          </Text>

          {/* 借用理由欄（貸出可能な場合のみ表示） */}
          {item.is_available && (
            <Box mt={4}>
              <Text mb={2}>借用理由:</Text>
              <Input
                placeholder="借用理由を入力"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                bg="white"
              />
            </Box>
          )}

          {item.is_available && (
            <Button mt={6} color="black" bg="gray.300" _hover={{ bg: "gray.400"}} onClick={handleBorrow}>
              借りる
            </Button>
          )}

        </Box>
      </Box>

      {/* 拡大表示（Modalの代替） */}
      {isZoomed && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="blackAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          onClick={() => setIsZoomed(false)}
        >
          <Image
            src={`/images/${item.image_path || "noImage.jpg"}`}
            alt={item.name}
            maxW="90%"
            maxH="90%"
            objectFit="contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/noImage.jpg";
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ItemDetailPage;
