import React, { useState, useEffect } from "react";
import "../styles/ParentDialog.css";
import "../styles/ParentCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const ParentEditDialog = ({ parent, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (parent) {
      setForm({
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
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
      };
      await API_SERVICE.parentAPI.update(parent.parentId, payload);
      setNotif({
        message: "Parent updated successfully!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Failed to update parent. ${error?.response?.data?.message || error.message}`,
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
          <h2>Edit Parent</h2>
          <button className="parent-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="parent-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name<span className="required">*</span></label>
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
            <label>Phone Number<span className="required">*</span></label>
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
            <label>Address</label>
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
              {loading ? "Updating..." : "Update Parent"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentEditDialog; 