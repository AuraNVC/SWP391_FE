import React, { useState } from "react";
import { API_SERVICE } from "../services/api";
import "../styles/HealthCheckScheduleDialog.css";

const HealthCheckScheduleEditDialog = ({ open, onClose, data, onUpdated }) => {
  const [form, setForm] = useState(data);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open || !data) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await API_SERVICE.healthCheckScheduleAPI.update(data.healthCheckScheduleId, {
        healthCheckScheduleId: data.healthCheckScheduleId,
        name: form.name,
        checkDate: form.checkDate,
        location: form.location,
        note: form.note,
      });
      onUpdated();
      onClose();
    } catch (error) {
      setErrorMsg("Cập nhật thất bại! " + (error?.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content" onClick={e => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Sửa lịch khám sức khỏe</h2>
          <button className="student-dialog-close" onClick={onClose}>×</button>
        </div>
        <form className="student-dialog-body" onSubmit={handleSubmit}>
          <div className="info-grid">
            <div className="info-item">
              <label>Form ID:</label>
              <input name="formId" value={form.formId} disabled className="form-control" />
            </div>
            <div className="info-item">
              <label>Manager ID:</label>
              <input name="managerId" value={form.managerId} disabled className="form-control" />
            </div>
            <div className="info-item">
              <label>Tên:</label>
              <input name="name" value={form.name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="info-item">
              <label>Ngày khám:</label>
              <input type="datetime-local" name="checkDate" value={form.checkDate} onChange={handleChange} required className="form-control" />
            </div>
            <div className="info-item">
              <label>Địa điểm:</label>
              <input name="location" value={form.location} onChange={handleChange} required className="form-control" />
            </div>
            <div className="info-item">
              <label>Ghi chú:</label>
              <input name="note" value={form.note} onChange={handleChange} className="form-control" />
            </div>
          </div>
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="student-dialog-footer">
            <button className="admin-btn" type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</button>
            <button className="admin-btn btn-secondary" type="button" onClick={onClose} disabled={loading}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthCheckScheduleEditDialog; 