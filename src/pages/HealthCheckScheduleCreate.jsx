import React, { useState } from "react";
import "../styles/StudentDashboard.css";
import { API_SERVICE } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";

const initialState = {
  formId: "",
  name: "",
  checkDate: "",
  location: "",
  note: "",
};

const HealthCheckScheduleCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { userId } = useUserRole();

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
      await API_SERVICE.healthCheckScheduleAPI.create({
        ...form,
        formId: Number(form.formId),
        managerId: Number(userId),
      });
      setSuccessMsg("Tạo lịch khám sức khỏe thành công!");
      setTimeout(() => {
        navigate('/manager/health-check-schedule');
      }, 1200);
    } catch (error) {
      setErrorMsg("Tạo lịch khám sức khỏe thất bại! " + (error?.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/health-check-schedule');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Tạo lịch khám sức khỏe</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Quay lại danh sách
        </button>
      </div>
      <div className="healthcheck-create-page-container">
        <form className="student-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Form ID<span className="required">*</span></label>
            <input
              type="text"
              name="formId"
              value={form.formId}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Nhập Form ID"
            />
          </div>
          <div className="form-group">
            <label>Tên lịch<span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Nhập tên lịch khám"
            />
          </div>
          <div className="form-group">
            <label>Ngày khám<span className="required">*</span></label>
            <input
              type="datetime-local"
              name="checkDate"
              value={form.checkDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Địa điểm<span className="required">*</span></label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Nhập địa điểm"
            />
          </div>
          <div className="form-group">
            <label>Ghi chú</label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              className="form-control"
              placeholder="Ghi chú (nếu có)"
            />
          </div>
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo mới"}
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

export default HealthCheckScheduleCreate; 