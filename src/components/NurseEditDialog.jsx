import React, { useState, useEffect } from "react";
import "../styles/NurseDialog.css";
import "../styles/NurseCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const NurseEditDialog = ({ nurse, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (nurse) {
      setForm({
        fullName: nurse.fullName || "",
        email: nurse.email || "",
        username: nurse.username || "",
      });
    }
  }, [nurse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        username: form.username,
      };
      await API_SERVICE.nurseAPI.update(nurse.nurseId, payload);
      setNotif({
        message: "Nurse updated successfully!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Failed to update nurse. ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!nurse) return null;

  return (
    <div className="nurse-dialog-overlay" onClick={onClose}>
      <div className="nurse-dialog-content nurse-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="nurse-dialog-header">
          <h2>Sửa thông tin y tá</h2>
          <button className="nurse-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="nurse-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên<span className="required"></span></label>
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
            <label>Email<span className="required"></span></label>
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
            <label>Tên người dùng<span className="required"></span></label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="nurse-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu" }
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={onClose}
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

export default NurseEditDialog; 