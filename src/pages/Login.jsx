import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      localStorage.setItem("userRole", "manager");
      navigate("/admin/dashboard");
    } else if (username === "nurse" && password === "nurse") {
      localStorage.setItem("userRole", "nurse");
      navigate("/nurse/dashboard");
    } else if (username === "parent" && password === "parent") {
      localStorage.setItem("userRole", "parent");
      navigate("/");
    } else if (username === "student" && password === "student") {
      localStorage.setItem("userRole", "student");
      navigate("/");
    } else {
      window.alert("Tên đăng nhập hoặc mật khẩu không đúng!");
    }

    window.location.reload();
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
                className="form-control"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
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
                className="form-control"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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