import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import "../styles/MedicalInventoryCreateForm.css";

const initialState = {
  managerId: "",
  medicalName: "",
  quantity: 0,
  unit: "",
  expiryDate: "",
  dateAdded: ""
};

const MedicalInventoryCreate = () => {
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
      await API_SERVICE.medicalInventoryAPI.create({
        ...form,
        managerId: Number(form.managerId),
        quantity: Number(form.quantity)
      });
      setSuccessMsg("Thêm vật tư thành công!");
      setNotif({ message: "Thêm vật tư thành công!", type: "success" });
      setTimeout(() => {
        navigate("/manager/medical-inventory");
      }, 1200);
    } catch (error) {
      const errorMessage = `Thêm vật tư thất bại. ${error.message}`;
      setErrorMsg(errorMessage);
      setNotif({ message: errorMessage, type: "error" });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate("/manager/medical-inventory");
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Thêm vật tư y tế mới</h2>
      </div>
      <div className="medical-inventory-create-page-container">
        <form className="medical-inventory-create-form" onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label>Mã quản lý<span className="required">*</span></label>
            <input type="number" name="managerId" value={form.managerId} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Tên vật tư<span className="required">*</span></label>
            <input type="text" name="medicalName" value={form.medicalName} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Số lượng<span className="required">*</span></label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Đơn vị<span className="required">*</span></label>
            <input type="text" name="unit" value={form.unit} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Ngày nhập<span className="required">*</span></label>
            <input type="date" name="dateAdded" value={form.dateAdded} onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Hạn sử dụng<span className="required">*</span></label>
            <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required className="form-control" />
          </div>
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>{loading ? "Đang thêm..." : "Thêm vật tư"}</button>
            <button type="button" className="admin-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalInventoryCreate; 