import React, { createContext, useContext, useState } from "react";

const UserRoleContext = createContext();

export function UserRoleProvider({ children }) {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  const login = (role) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    setUserRole(null);
  };

  return (
    <UserRoleContext.Provider value={{ userRole, login, logout }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}