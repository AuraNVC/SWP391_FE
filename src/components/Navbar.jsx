import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";
import logoSchoolCare from '../assets/logoSchoolCare.png';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';

const Navbar = ({ isLoggedIn, avatarUrl, extraLinks = [] }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const avatarRef = useRef(null);
  const { logout, userRole, userId } = useUserRole();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  // Fetch user info based on role and userId
  useEffect(() => {
    if (isLoggedIn && userRole && userId) {
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
            await response.json(); // fetch nhưng không dùng nữa
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          // setLoading(false); // This line was removed as per the edit hint
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
          <img src={logoSchoolCare} alt="Logo Trường" height="40" className="me-2 " />
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
              {/* <div className="me-3 text-white">
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
              </div> */}
              <img
                src={avatarUrl}
                alt="avatar"
                className="rounded-circle border border-white shadow"
                style={{ width: 40, height: 40, cursor: "pointer" }}
                onClick={handleAvatarClick}
                ref={avatarRef}
              />
              <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ style: { minWidth: 140, padding: 8 } }}
              >
                <Button
                  variant="text"
                  color="error"
                  fullWidth
                  onClick={() => { handleLogout(); handlePopoverClose(); }}
                >
                  Đăng xuất
                </Button>
              </Popover>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;