import React, { useState, useEffect } from "react";
import "../styles/BlogDialog.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const MedicalInventoryEditDialog = ({ item, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    medicalInventoryId: 0,
    managerId: 0,
    medicalName: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
    dateAdded: ""
  });
  const [loading, setLoading] = useState(false);
  const { setNotif } = useNotification();

  useEffect(() => {
    if (item) {
      setForm({
        medicalInventoryId: item.medicalInventoryId,
        managerId: item.managerId,
        medicalName: item.medicalName,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        dateAdded: item.dateAdded
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.medicalInventoryAPI.update(form);
      setNotif({ message: "Cập nhật vật tư thành công!", type: "success" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({ message: `Cập nhật thất bại. ${error.message}`, type: "error" });
    }
    setLoading(false);
  };

  if (!item) return null;

  return (
    <div className="blog-dialog-overlay" onClick={onClose}>
      <div className="blog-dialog-content blog-edit-dialog" onClick={e => e.stopPropagation()}>
        <div className="blog-dialog-header">
          <h2>Sửa vật tư y tế</h2>
          <button className="blog-dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên vật tư</label>
            <input type="text" name="medicalName" value={form.medicalName} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Đơn vị</label>
            <input type="text" name="unit" value={form.unit} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Ngày nhập</label>
            <input type="date" name="dateAdded" value={form.dateAdded} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Hạn sử dụng</label>
            <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required className="form-control" />
          </div>
          <div className="blog-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>{loading ? "Đang cập nhật..." : "Cập nhật"}</button>
            <button type="button" className="admin-btn cancel-btn" onClick={onClose} disabled={loading}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalInventoryEditDialog; 