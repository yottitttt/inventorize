import {
    Box,
    Button,
    Heading,
    Input,
    Text,
    Flex,
    Spinner,
    Link,
    HStack,
  } from "@chakra-ui/react";
  import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
  import { useState, useEffect } from "react";
  import axios from "axios";
  
  type User = {
    id: number;
    name: string;
    grade: string;
    email: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

  const API_URL = import.meta.env.VITE_API_URL;
  
  const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    
    // フォームの状態
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isActive, setIsActive] = useState(true);
  
    // ユーザーデータを取得
    useEffect(() => {
      const fetchUser = async () => {
        setLoading(true);
        try {
          console.log("取得するユーザーID:", id);
          
          const response = await axios.get(`${API_URL}/users/${id}`, {
            withCredentials: true
          });
          console.log("ユーザーデータ:", response.data);
          
          setUser(response.data);
          
          // フォームの初期値を設定
          setName(response.data.name || "");
          setGrade(response.data.grade || "");
          setEmail(response.data.email || "");
          setIsAdmin(response.data.is_admin || false);
          setIsActive(response.data.is_active !== undefined ? response.data.is_active : true);
        } catch (error) {
          console.error("ユーザー取得エラー:", error);
          
          if (axios.isAxiosError(error)) {
            if (error.response) {
              setError(`APIエラー: ${error.response.status} - ${error.response.data.detail || "ユーザーが見つかりません"}`);
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
        fetchUser();
      }
    }, [id]);

    const handleUpdate = async () => {
      if (!id) return;
      
      // バリデーション
      if (!name.trim()) {
        setError("名前を入力してください");
        return;
      }
      if (!grade.trim()) {
        setError("学年を選択してください");
        return;
      }
      if (!email.trim()) {
        setError("メールアドレスを入力してください");
        return;
      }
      
      setSaving(true);
      setError(null);
      
      try {
        const updateData = {
          name,
          grade,
          email,
          ...(newPassword && { password: newPassword }),
          is_admin: isAdmin,
          is_active: isActive
        };
        
        await axios.put(`${API_URL}/users/${id}`, updateData, {
          withCredentials: true
        });
        
        console.log("ユーザー更新完了");
        navigate("/list_user");
      } catch (error) {
        console.error("ユーザー更新エラー:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setError(`更新エラー: ${error.response.status} - ${error.response.data.detail || "ユーザーの更新に失敗しました"}`);
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

    // 学年の選択肢
    const gradeOptions = [
      { value: "", label: "学年を選択" },
      { value: "U4", label: "U4" },
      { value: "M1", label: "M1" },
      { value: "M2", label: "M2" },
      { value: "OB_OG", label: "OB_OG" },
    ];

    if (loading) {
      return (
        <Box p={8} textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>データを読み込んでいます...</Text>
        </Box>
      );
    }
  
    if (!user && !loading) {
      return (
        <Box p={8}>
          <Flex mb={6}>
            <Link 
              as={RouterLink}
              to="/list_user"
              fontSize="lg"
              fontWeight="bold"
              color="gray.400"
              textDecoration="underline"
              mr={2}
              _hover={{ color: "blue.500", textDecoration: "underline" }}
            >
              User List
            </Link>
            <Text color="gray.400">/ Error</Text>
          </Flex>
          
          <Text color="red.500" fontSize="lg">対象のユーザーが見つかりません</Text>
          <Text mt={2}>ID: {id}</Text>
          
          {error && (
            <Box p={4} bg="red.100" color="red.800" borderRadius="md" my={4}>
              {error}
            </Box>
          )}
          
          <Button 
            mt={4} 
            colorScheme="blue" 
            onClick={() => navigate("/list_user")}
          >
            ユーザー一覧に戻る
          </Button>
        </Box>
      );
    }
  
    return (
      <Box p={8}>
        <Flex mb={6}>
          <Link 
            as={RouterLink}
            to="/list_user"
            fontSize="lg"
            fontWeight="bold"
            color="gray.400"
            textDecoration="underline"
            mr={2}
            _hover={{ color: "blue.500", textDecoration: "underline" }}
          >
            User List
          </Link>
          <Text color="gray.400">/ Edit User</Text>
        </Flex>
      
        <Heading size="md" mb={6}>
          「{user?.name}」を編集
        </Heading>
  
        {error && (
          <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
            {error}
          </Box>
        )}
  
        <Box maxW="600px">
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>名前：</Text>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              bg="white"
              isDisabled={saving}
            />
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>学年：</Text>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={saving}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #CBD5E0",
                backgroundColor: "white",
                fontSize: "1rem",
              }}
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>メールアドレス：</Text>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              bg="white"
              isDisabled={saving}
            />
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>パスワード：</Text>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              bg="white"
              isDisabled={saving}
            />
          </Box>
  
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>権限と状態：</Text>
            <HStack spacing={6}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  disabled={saving}
                  style={{ marginRight: "8px" }} 
                />
                管理者権限
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={saving}
                  style={{ marginRight: "8px" }} 
                />
                アクティブ
              </label>
            </HStack>
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
              onClick={() => navigate("/list_user")}
              isDisabled={saving}
            >
              キャンセル
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  };
  
  export default EditUserPage;
  