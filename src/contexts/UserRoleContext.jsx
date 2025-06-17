import React, { createContext, useContext, useState } from "react";

const UserRoleContext = createContext();

export function UserRoleProvider({ children }) {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  const login = ({ role, token, id }) => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", id);
    setUserRole(role);
    setAccessToken(token);
    setUserId(id);
    console.log("Login successful:", { role, token, id });
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setUserRole(null);
    setAccessToken(null);
    setUserId(null);
  };

  return (
    <UserRoleContext.Provider value={{ userRole, accessToken, userId, login, logout }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}