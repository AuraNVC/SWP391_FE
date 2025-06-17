import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";
import { useUserRole } from "../contexts/UserRoleContext"; // Thêm dòng này

const Sidebar = ({ extraLinks = [] }) => {
    const navigate = useNavigate();
    const { logout } = useUserRole(); // Lấy hàm logout từ context

    const handleLogout = () => {
        logout(); // Xóa localStorage và cập nhật state
        navigate("/login");
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
                        <FaSignOutAlt /> Logout
                    </a>
                </li>
            </ul>
            <div className="navbar-profile">
                <img src="https://i.pravatar.cc/40?img=3" alt="Admin" />
                <div>
                    <div className="navbar-profile-name">Admin</div>
                    <div className="navbar-profile-link"><a href="/admin/profile">View profile</a></div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;