import React, { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";
import { API_SERVICE } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "../contexts/UserRoleContext";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const initialState = {
  formId: "",
  name: "",
  scheduleDate: "",
  location: "",
  note: "",
};

const VaccinationScheduleCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [forms, setForms] = useState([]); // Danh sách form loại vaccine
  const navigate = useNavigate();
  const { userId } = useUserRole();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await API_SERVICE.formAPI.getAll({ keyword: "" });
        // console.log(res.filter(f => f.type === "Vaccine"));
        setForms(res.filter(f => f.type === "Vaccine"));
      } catch {
        setForms([]);
      }
    };
    fetchForms();
    // console.log(forms);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value) => {
    setForm((prev) => ({ ...prev, scheduleDate: value ? value.toISOString() : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API_SERVICE.vaccinationScheduleAPI.create({
        ...form,
        formId: Number(form.formId),
        managerId: Number(userId),
      });
      setSuccessMsg("Tạo lịch tiêm chủng thành công!");
      setTimeout(() => {
        navigate('/manager/vaccination-schedule');
      }, 1200);
    } catch (error) {
      setErrorMsg("Tạo lịch tiêm chủng thất bại! " + (error?.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/vaccination-schedule');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Tạo lịch tiêm chủng</h2>
      </div>
      <div className="healthcheck-create-page-container">
        <form className="student-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Biểu mẫu<span className="required">*</span></label>
            <select
              name="formId"
              value={form.formId}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn biểu mẫu tiêm chủng</option>
              {forms.map(f => (
                <option key={f.formId} value={f.formId}>{f.title} (Lớp: {f.className})</option>
              ))}
            </select>
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
              placeholder="Nhập tên lịch tiêm"
            />
          </div>
          <div className="form-group">
            <label>Ngày tiêm<span className="required">*</span></label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Chọn ngày giờ tiêm"
                value={form.scheduleDate ? new Date(form.scheduleDate) : null}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: { required: true, className: "form-control", name: "scheduleDate" },
                  paper: { sx: { minWidth: 260, maxWidth: 320 } }
                }}
                format="HH:mm dd/MM/yyyy"
              />
            </LocalizationProvider>
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

export default VaccinationScheduleCreate; 