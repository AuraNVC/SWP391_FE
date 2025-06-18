import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext"; // Thêm dòng này

const Navbar = ({ isLoggedIn, avatarUrl, extraLinks = [] }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const avatarRef = useRef(null);
  const { logout } = useUserRole();

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogout = () => {
    console.log("logout")
    logout(); // Gọi hàm logout từ context
    setShowMenu(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
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
            {extraLinks.map((item, idx) => (
              <li className="nav-item mx-2" key={idx}>
                {item}
              </li>
            ))}
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
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu((prev) => !prev);
                }}
                ref={avatarRef}
              />
              {showMenu && (
                <div
                  className="position-absolute mt-2 p-2 bg-white shadow rounded"
                  style={{
                    minWidth: 120,
                    zIndex: 1000,
                    top: "70%",
                    right: 60,
                  }}
                >
                  <button
                    type="button"
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