import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";

const Navbar = ({ isLoggedIn, avatarUrl, extraLinks = [] }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const avatarRef = useRef(null);
  const { logout, userRole, userId } = useUserRole();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  // Fetch user info based on role and userId
  useEffect(() => {
    if (isLoggedIn && userRole && userId) {
      setLoading(true);
      const fetchUserInfo = async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          let endpoint = '';
          switch (userRole) {
            case 'manager':
              endpoint = `${API_BASE_URL}/manager/${userId}`;
              break;
            case 'nurse':
              endpoint = `${API_BASE_URL}/nurse/${userId}`;
              break;
            case 'parent':
              endpoint = `${API_BASE_URL}/parent/${userId}`;
              break;
            case 'student':
              endpoint = `${API_BASE_URL}/student/${userId}`;
              break;
            default:
              return;
          }

          const response = await fetch(endpoint, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const user = await response.json();
            let fullName = '';
            switch (userRole) {
              case 'manager':
                fullName = user.fullName || 'Quản lý';
                break;
              case 'nurse':
                fullName = user.fullName || 'Y tá';
                break;
              case 'parent':
                fullName = user.fullName || 'Phụ huynh';
                break;
              case 'student':
                fullName = user.fullName || 'Học sinh';
                break;
              default:
                fullName = 'Người dùng';
            }
            setUserInfo({ fullName });
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserInfo();
    }
  }, [isLoggedIn, userRole, userId]);

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
              {/* Greeting */}
              <div className="me-3 text-white">
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : userInfo ? (
                  <span className="fw-semibold">Xin chào, {userInfo.fullName}</span>
                ) : (
                  <span className="fw-semibold">
                    Xin chào, {userRole === 'manager' ? 'Quản lý' : 
                              userRole === 'nurse' ? 'Y tá' : 
                              userRole === 'parent' ? 'Phụ huynh' : 
                              userRole === 'student' ? 'Học sinh' : 'Người dùng'}
                  </span>
                )}
              </div>
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