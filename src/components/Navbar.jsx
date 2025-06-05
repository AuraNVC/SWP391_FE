import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, avatarUrl, currentPage = "home" }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const avatarRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setShowMenu(false);
    navigate("/login");
    window.location.reload();
  };

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);


  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow fixed-top" style={{ backgroundColor: "#0d9488" }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="src/assets/logoSchoolCare.png" alt="Logo Trường" height="40" className="me-2 " />
          <span className="fw-bold fs-5">School Care</span>
        </Link>
        <div>
          <ul className="navbar-nav flex-row mb-0">
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "home" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/"
              >
                Trang chủ
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "contact" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/blog"
              >
                Blog
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "contact" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/contact"
              >
                Liên hệ
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                className={`nav-link ${currentPage === "about" ? "text-body-tertiary fw-bold" : "text-white"}`}
                to="/about"
              >
                Giới thiệu
              </Link>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          {!isLoggedIn ? (
            <button
              onClick={handleLoginClick}
              className="btn btn-teal-700 text-white px-4 py-2 rounded ms-2 bg-primary shadow"
            >
              Đăng nhập
            </button>
          ) : (
            <>
              <img
                src={avatarUrl}
                alt="avatar"
                className="rounded-circle border border-white shadow"
                style={{ width: 40, height: 40, cursor: "pointer" }}
                onClick={() => setShowMenu((prev) => !prev)}
              />
              {showMenu && (
                <div
                  className="position-absolute end-0 mt-2 p-2 bg-white shadow rounded"
                  style={{ minWidth: 120, zIndex: 1000 }}
                >
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;