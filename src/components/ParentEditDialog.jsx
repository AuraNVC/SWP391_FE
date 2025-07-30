import React, { useState, useEffect } from "react";
import "../styles/ParentDialog.css";
import "../styles/ParentCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const ParentEditDialog = ({ parent, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    parentId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (parent) {
      console.log(parent.parentId)
      setForm({
        parentId: parent.parentId || "",
        fullName: parent.fullName || "",
        email: parent.email || "",
        phoneNumber: parent.phoneNumber || "",
        address: parent.address || "",
      });
    }
  }, [parent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        parentId: form.parentId,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
      };
      await API_SERVICE.parentAPI.update(parent.parentId, payload);
      setNotif({
        message: "Thay đổi thông tin thành công!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Lỗi không thể thay đổi. ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!parent) return null;

  return (
    <div className="parent-dialog-overlay" onClick={onClose}>
      <div className="parent-dialog-content parent-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="parent-dialog-header">
          <h2>Sửa thông tin phụ huynh</h2>
          <button className="parent-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="parent-create-form" onSubmit={handleSubmit}>
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
            <label>Số điện thoại<span className="required"></span></label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="form-control"
              inputMode="numeric"
              pattern="[0-9]"
              onInput={e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
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
          
          <div className="parent-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
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

export default ParentEditDialog; 