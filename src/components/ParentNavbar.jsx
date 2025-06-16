import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";

export default function ParentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getCurrentPage = () => {
    if (location.pathname === "/parent") return "home";
    if (location.pathname === "/parent/blog") return "blog";
    if (location.pathname === "/parent/notifications") return "notifications";
    return "";
  };

  const currentPage = getCurrentPage();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow fixed-top" style={{ backgroundColor: "#0d9488" }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/parent">
          <img src={logoSchoolCare} alt="Logo Trường" height="40" className="me-2" />
          <span className="fw-bold fs-5">School Care</span>
        </Link>
        <div>
          <ul className="navbar-nav flex-row mb-0">
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "home" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/parent"
              >
                Trang chủ
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "blog" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/parent/blog"
              >
                Blog
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "notifications" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/parent/notifications"
              >
                Thông báo
              </Link>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-light ms-2"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
} 