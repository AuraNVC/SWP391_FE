import React, { useState, useEffect } from "react";
import "../styles/StudentDialog.css";
import "../styles/StudentCreateForm.css";
import "../styles/FormValidation.css";
import "../styles/ConfirmationDialog.css";
import { API_SERVICE } from "../services/api";
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNotification } from "../contexts/NotificationContext";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { validateForm } from "../utils/validation";
import ConfirmationDialog from "./ConfirmationDialog";

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
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  
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
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };
  
  const validationRules = {
    fullName: [
      { type: 'required', message: 'Họ tên là bắt buộc' },
      { type: 'maxLength', value: 100, message: 'Họ tên không được vượt quá 100 ký tự' }
    ],
    dateOfBirth: [
      { type: 'required', message: 'Ngày sinh là bắt buộc' },
      { type: 'date', message: 'Ngày sinh không hợp lệ' }
    ],
    className: [
      { type: 'required', message: 'Lớp là bắt buộc' }
    ],
    gender: [
      { type: 'required', message: 'Giới tính là bắt buộc' }
    ],
    studentNumber: [
      { type: 'required', message: 'Mã học sinh là bắt buộc' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(form, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  const confirmUpdate = async () => {
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
        message: "Cập nhật học sinh thành công!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Cập nhật học sinh thất bại! ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
    setShowConfirmation(false);
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
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Ngày tháng năm sinh<span className="required">*</span></label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày sinh"
                value={dateOfBirth}
                onChange={(newValue) => {
                  setDateOfBirth(newValue);
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ""
                  }));
                  // Clear error when field is edited
                  if (errors.dateOfBirth) {
                    setErrors((prev) => ({ ...prev, dateOfBirth: null }));
                  }
                }}
                renderInput={(params) => <TextField {...params} required fullWidth error={!!errors.dateOfBirth} />}
              />
            </LocalizationProvider>
            {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
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
            {errors.className && <div className="invalid-feedback">{errors.className}</div>}
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
            {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
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
            {errors.studentNumber && <div className="invalid-feedback">{errors.studentNumber}</div>}
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
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmUpdate}
        title="Xác nhận cập nhật"
        message="Bạn có chắc chắn muốn cập nhật thông tin học sinh này không?"
        confirmText="Cập nhật"
        cancelText="Hủy"
      />
    </div>
  );
};

export default StudentEditDialog; 