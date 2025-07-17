import React, { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";
import { useUserRole } from "../contexts/UserRoleContext"; // Thêm dòng này

const Sidebar = ({ extraLinks = [] }) => {
    const navigate = useNavigate();
    const { logout, userRole } = useUserRole(); // Lấy hàm logout và userRole từ context
    const [userName, setUserName] = useState("Người dùng");
    const [avatarIndex, setAvatarIndex] = useState(3); // Default avatar

    // Lấy thông tin người dùng từ localStorage khi component mount
    useEffect(() => {
        const storedUserRole = localStorage.getItem("userRole");
        const storedUserName = localStorage.getItem("userName") || "Người dùng";
        
        // Đặt tên người dùng
        setUserName(storedUserName);
        
        // Đặt avatar dựa trên vai trò
        if (storedUserRole === "nurse") {
            setAvatarIndex(8); // Avatar phù hợp cho y tá
        } else if (storedUserRole === "manager") {
            setAvatarIndex(3); // Avatar cho quản lý
        } else if (storedUserRole === "parent") {
            setAvatarIndex(5); // Avatar cho phụ huynh
        }
    }, [userRole]);

    const handleLogout = () => {
        logout(); // Xóa localStorage và cập nhật state
        navigate("/login");
    };

    // Xác định đường dẫn profile dựa trên vai trò
    const getProfilePath = () => {
        const role = localStorage.getItem("userRole");
        if (role === "nurse") return "/nurse/profile";
        if (role === "manager") return "/admin/profile";
        if (role === "parent") return "/parent/profile";
        return "/profile";
    };

    return (
        <nav className="navbar-manager">
            <div className="navbar-logo">
                <img src={logoSchoolCare} alt="Logo Trường" className="me-2" />
                <span className="navbar-logo-text">SchoolCare</span>
            </div>
            <ul className="navbar-menu">
                {extraLinks.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
                <li className="navbar-logout">
                    <a href="#" onClick={handleLogout}>
                        <FaSignOutAlt /> Đăng xuất
                    </a>
                </li>
            </ul>
            <div className="navbar-profile">
                <img src={`https://i.pravatar.cc/40?img=${avatarIndex}`} alt={userName} />
                <div>
                    <div className="navbar-profile-name">{userName}</div>
                    <div className="navbar-profile-link"><a href={getProfilePath()}>Xem chi tiết</a></div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;