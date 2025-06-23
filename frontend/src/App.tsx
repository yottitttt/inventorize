import { Box, Flex } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Sidebar from "./components/ui/Sidebar";
import EquipumentsPage from "./pages/EquipumentsPage";
import AdminPage from "./pages/AdminPage";
import ChangepasswordPage from "./pages/ChangepasswordPage";
import MylistPage from "./pages/MylistPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordpage";
import ResetPasswordPage from "./pages/ResetPasswordpage";

import AddEquipumentPage from "./pages/AddEquipmentpage";
import EditEquipumentPage from "./pages/EditEquipmentpage";
import AddUserPage from "./pages/AddUserpage";
import EditUserPage from "./pages/EditUserpage";
import AddCategoryPage from "./pages/AddCategorypage";
import EditCategoryPage from "./pages/EditCategorypage";

import EquipmentListPage from "./pages/EquipmentListpage";
import UserListPage from "./pages/UserListPage";
import CategoryListPage from "./pages/CategoryListpage";
import ItemDetailPage from "./pages/ItemDetailPage";

function AppContent() {
  const location = useLocation();
  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup"||
    location.pathname === "/forgot-password"||
    location.pathname.startsWith("/reset-password");

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.100">
      <Sidebar />
      <Box ml="250px" flex="1" p={8}>
        <Routes>
          <Route path="/equipuments" element={<ProtectedRoute><EquipumentsPage /></ProtectedRoute>} />
          <Route path="/equipuments/:id" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
          <Route path="/changepassword" element={<ProtectedRoute><ChangepasswordPage /></ProtectedRoute>} />
          <Route path="/mylist" element={<ProtectedRoute><MylistPage /></ProtectedRoute>} />
          <Route path="/admin/add-equipment" element={<AdminProtectedRoute><AddEquipumentPage /></AdminProtectedRoute>} />
          <Route path="/edit_equipment/:id" element={<AdminProtectedRoute><EditEquipumentPage /></AdminProtectedRoute>} />
          <Route path="/admin/add-user" element={<AdminProtectedRoute><AddUserPage /></AdminProtectedRoute>} />
          <Route path="/edit_user/:id" element={<AdminProtectedRoute><EditUserPage /></AdminProtectedRoute>} />
          <Route path="/admin/add-category" element={<AdminProtectedRoute><AddCategoryPage /></AdminProtectedRoute>} />
          <Route path="/edit_category/:id" element={<AdminProtectedRoute><EditCategoryPage /></AdminProtectedRoute>} />
          <Route path="/list_equipment" element={<AdminProtectedRoute><EquipmentListPage /></AdminProtectedRoute>} />
          <Route path="/list_user" element={<AdminProtectedRoute><UserListPage /></AdminProtectedRoute>} />
          <Route path="/list_category" element={<AdminProtectedRoute><CategoryListPage /></AdminProtectedRoute>} />
        </Routes>
      </Box>
    </Flex>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
