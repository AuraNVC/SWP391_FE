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
import FormField from "./FormField";
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
  
  const genderOptions = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" }
  ];

  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content student-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Chỉnh sửa học sinh</h2>
          <button className="student-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="student-create-form" onSubmit={handleSubmit}>
          <FormField
            label="Họ tên"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
          />
          
          <div className="form-group">
            <label htmlFor="dateOfBirth">Ngày sinh<span className="required">*</span></label>
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
          
          <FormField
            label="Lớp"
            name="className"
            value={form.className}
            onChange={handleChange}
            required
            error={errors.className}
            placeholder="VD: 1A"
          />
          
          <FormField
            label="Giới tính"
            name="gender"
            type="select"
            value={form.gender}
            onChange={handleChange}
            required
            error={errors.gender}
            options={genderOptions}
            placeholder="Chọn giới tính"
          />
          
          <FormField
            label="Mã học sinh"
            name="studentNumber"
            value={form.studentNumber}
            onChange={handleChange}
            required
            error={errors.studentNumber}
            placeholder="VD: binhan1"
          />
          
          <div className="student-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật học sinh"}
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