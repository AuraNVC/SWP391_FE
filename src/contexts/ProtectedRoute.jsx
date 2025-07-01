import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";

export default function ProtectedRoute({ children, roles, requiredRole }) {
  const { userRole } = useUserRole();
  const location = useLocation();

  if (!userRole) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ notif: { message: "Bạn chưa đăng nhập!", type: "error" }, from: location.pathname }}
      />
    );
  }
  
  // Kiểm tra nếu có requiredRole cụ thể
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Navigate
        to="/"
        replace
        state={{ notif: { message: "Bạn không có quyền truy cập trang này!", type: "error" }, from: location.pathname }}
      />
    );
  }
  
  // Kiểm tra nếu có mảng roles
  if (roles && !roles.includes(userRole)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ notif: { message: "Bạn không có quyền truy cập trang này!", type: "error" }, from: location.pathname }}
      />
    );
  }
  
  return children;
}