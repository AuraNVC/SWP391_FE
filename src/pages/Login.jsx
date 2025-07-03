import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";
import logoSchoolCare from "../assets/logoSchoolCare.png";
import { API_SERVICE } from "../services/api";

export default function Login({ setNotif }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  // Error states cho từng trường
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useUserRole();

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng tới trang dashboard tương ứng
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      switch (userRole) {
        case "manager":
          navigate("/manager/dashboard");
          break;
        case "student":
          navigate("/");
          break;
        case "nurse":
          navigate("/nurse/medical-events");
          break;
        case "parent":
          navigate("/");
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state && location.state.notif) {
      setNotif(location.state.notif);
      // Xóa state sau khi dùng để tránh lặp lại khi quay lại trang này
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setNotif]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    setRoleError("");
    let hasError = false;

    if (!username) {
      setUsernameError("Vui lòng nhập tên đăng nhập.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      hasError = true;
    }
    if (!role) {
      setRoleError("Vui lòng chọn vai trò.");
      hasError = true;
    }
    if (hasError) return;

    // Lấy redirect từ query string, mặc định là '/'
    let redirectPath = searchParams.get("redirect") || "/";
    try {
      let data;
      if (role === "manager") {
        data = await API_SERVICE.login.manager({
          email: username,
          password,
        });
        if (!(data && data.user.accessToken && data.user.id)) {
          throw new Error();
        }
        redirectPath = "/manager/dashboard";
      } else if (role === "student") {
        data = await API_SERVICE.login.student({
          studentNumber: username,
          password,
        });
        if (!(data && data.user.accessToken && data.user.id)) {
          throw new Error();
        }
        redirectPath = "/";
      } else if (role === "nurse") {
        data = await API_SERVICE.login.nurse({
          email: username,
          password,
        });
        if (!(data && data.user.accessToken && data.user.id)) {
          throw new Error();
        }
        redirectPath = "/nurse/medical-events";
      } else if (role === "parent") {
        data = await API_SERVICE.login.parent({
          email: username,
          password,
        });
        if (!(data && data.user.accessToken && data.user.id)) {
          throw new Error();
        }
        redirectPath = "/";
      }

      // Nếu tới đây là đăng nhập thành công
      login({
        role,
        token: data.user.accessToken,
        id: data.user.id,
      });
      setNotif({ message: "Đăng nhập thành công!", type: "success" });
      navigate(redirectPath);
    } catch {
      setUsernameError("Tên đăng nhập hoặc mật khẩu không đúng.");
      setPasswordError("Tên đăng nhập hoặc mật khẩu không đúng.");
      setNotif({
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
        type: "error",
      });
    }
  };

  return (
    <div
      className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center"
      style={{ paddingTop: 70 }}
    >
      {/* Nút quay về Home */}
      <button
        type="button"
        className="btn btn-link position-absolute top-0 start-0 m-3"
        onClick={() => navigate("/")}
        style={{ zIndex: 10 }}
      >
        &larr; Về trang chủ
      </button>
      <div
        className="card shadow w-100 mx-auto"
        style={{ maxWidth: 400 }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src={logoSchoolCare}
              alt="Logo SchoolCare"
              style={{ height: 64 }}
              className="mb-3"
            />
            <h2 className="h3 mb-2 fw-bold text-dark">Đăng Nhập</h2>
            <p className="text-muted mb-0">Vui lòng đăng nhập để tiếp tục</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`form-control${usernameError ? " is-invalid" : ""}`}
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              {usernameError && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {usernameError}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`form-control${passwordError ? " is-invalid" : ""}`}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {passwordError}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Chọn vai trò
              </label>
              <select
                id="role"
                className={`form-select${roleError ? " is-invalid" : ""}`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="manager">Quản trị viên</option>
                <option value="nurse">Y tá</option>
                <option value="parent">Phụ huynh</option>
                <option value="student">Học sinh</option>
              </select>
              {roleError && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {roleError}
                </div>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="form-check-input"
                />
                <label htmlFor="remember-me" className="form-check-label">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="#" className="text-primary small">
                Quên mật khẩu?
              </a>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Đăng nhập
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-muted mb-0">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-primary">
                Liên hệ quản trị viên
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}