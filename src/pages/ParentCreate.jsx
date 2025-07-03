import React, { useState } from "react";
import "../styles/ParentCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from 'react-router-dom';

const initialState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  address: "",
  passwordHash: "",
};

const ParentCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        passwordHash: form.passwordHash || form.phoneNumber, // Use phone number as default password
      };
      await API_SERVICE.parentAPI.create(payload);
      setSuccessMsg("Tạo phụ huynh thành công!");
      setNotif({
        message: "Tạo phụ huynh thành công!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/parent');
      }, 1500);
    } catch (error) {
      const errorMessage = "Tạo phụ huynh thất bại. " + (error?.response?.data?.message || error.message);
      setErrorMsg(errorMessage);
      setNotif({
        message: errorMessage,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/parent');
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Thêm phụ huynh mới</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Quay lại danh sách phụ huynh
        </button>
      </div>
      
      <div className="parent-create-page-container">
        <form className="parent-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên<span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email<span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại<span className="required">*</span></label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="passwordHash"
                value={form.passwordHash}
                onChange={handleChange}
                className="form-control"
                placeholder="Để trống để dùng số điện thoại làm mật khẩu"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  userSelect: "none"
                }}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo phụ huynh"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentCreate; 