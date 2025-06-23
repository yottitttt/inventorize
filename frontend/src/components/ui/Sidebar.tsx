import { Box, VStack, Text, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });
        setIsAdmin(res.data.is_admin);
      } catch (err) {
        console.error("ユーザー情報の取得に失敗しました", err);
        setIsAdmin(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <Box w="250px" bg="gray.800" color="white" h="100vh" p={5} position="fixed">
      <VStack align="start" spacing={4}>
        <Text fontSize="xl" fontWeight="bold">ISDL物品管理</Text>
        <Link as={RouterLink} to="/equipuments">Equipuments</Link>
        <Link as={RouterLink} to="/mylist">My List</Link>
        {isAdmin && <Link as={RouterLink} to="/admin">Admin</Link>}
        <Link as={RouterLink} to="/changepassword">Change Password</Link>
      </VStack>
    </Box>
  );
};

export default Sidebar;