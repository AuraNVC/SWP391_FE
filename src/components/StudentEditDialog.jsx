import React, { useState, useEffect } from "react";
import "../styles/StudentDialog.css";
import "../styles/StudentCreateForm.css";
import { API_SERVICE } from "../services/api";
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNotification } from "../contexts/NotificationContext";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const StudentEditDialog = ({ student, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    className: "",
    gender: "",
    studentNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName || "",
        dateOfBirth: student.dateOfBirth || "",
        className: student.className || "",
        gender: student.gender || "",
        studentNumber: student.studentNumber || "",
      });
      if (student.dateOfBirth) {
        setDateOfBirth(new Date(student.dateOfBirth));
      }
    }
  }, [student]);

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
        dateOfBirth: form.dateOfBirth,
        className: form.className,
        gender: form.gender,
        studentNumber: form.studentNumber,
      };
      await API_SERVICE.studentAPI.update(student.studentId, payload);
      setNotif({
        message: "Student updated successfully!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Failed to update student. ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!student) return null;

  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content student-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Sửa thông tin học sinh</h2>
          <button className="student-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="student-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên<span className="required">*</span></label>
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
            <label htmlFor="dateOfBirth">Ngày tháng năm sinh<span className="required">*</span></label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={dateOfBirth}
                onChange={(newValue) => {
                  setDateOfBirth(newValue);
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ""
                  }));
                }}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div className="form-group">
            <label>Lớp<span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={form.className}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. 1A"
            />
          </div>
          <div className="form-group">
            <label>Giới tính<span className="required">*</span></label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tên đăng nhập<span className="required">*</span></label>
            <input
              type="text"
              name="studentNumber"
              value={form.studentNumber}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. binhan1"
            />
          </div>
          
          <div className="student-dialog-footer">
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

export default StudentEditDialog; 