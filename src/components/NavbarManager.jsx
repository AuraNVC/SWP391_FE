import React from "react";
import {
    FaTachometerAlt, FaUser, FaUsers, FaUserTie, FaBook, FaClipboardList,
    FaSignOutAlt, FaBlog, FaChalkboardTeacher
} from "react-icons/fa";
import "../styles/NavbarManager.css";
import { useNavigate } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";

const NavbarManager = () => {

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("userRole");
        navigate("/login");
        window.location.reload();
    };

    return (
        <nav className="navbar-manager">
            <div className="navbar-logo">
                <img src={logoSchoolCare} alt="Logo Trường" className="me-2" />
                <span className="navbar-logo-text">SchoolCare</span>
            </div>
            <ul className="navbar-menu">
                <li><a href="/admin/dashboard"><FaTachometerAlt /> Dashboard</a></li>
                <li><a href="/admin/users"><FaUser /> User</a></li>
                <li><a href="/admin/staff"><FaUsers /> Staff</a></li>
                <li><a href="/admin/consultant"><FaUserTie /> Consultant</a></li>
                <li><a href="/admin/blog"><FaBlog /> Blog</a></li>
                <li><a href="/admin/course"><FaBook /> Course</a></li>
                <li><a href="/admin/log"><FaClipboardList /> Log</a></li>
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

export default NavbarManager;