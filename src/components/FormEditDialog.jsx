import React, { useState, useEffect } from "react";
import "../styles/FormDialog.css";
import "../styles/FormCreateForm.css";
import "../styles/FormValidation.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import ConfirmationDialog from "./ConfirmationDialog";
import { validateForm } from "../utils/validation";

const FormEditDialog = ({ form, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    className: "",
    type: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || "",
        className: form.className || "",
        type: form.type || "",
        content: form.content || "",
      });
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validationRules = {
    title: [
      { type: 'required', message: 'Tiêu đề là bắt buộc' },
      { type: 'maxLength', value: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' }
    ],
    className: [
      { type: 'required', message: 'Lớp là bắt buộc' }
    ],
    type: [
      { type: 'required', message: 'Loại biểu mẫu là bắt buộc' }
    ],
    content: [
      { type: 'required', message: 'Nội dung là bắt buộc' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, validationRules);
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
        title: formData.title,
        className: formData.className,
        type: formData.type,
        content: formData.content,
      };
      await API_SERVICE.formAPI.update(form.formId, payload);
      setNotif({
        message: "Cập nhật biểu mẫu thành công!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Cập nhật biểu mẫu thất bại! ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
    setShowConfirmation(false);
  };

  if (!form) return null;

  return (
    <div className="form-dialog-overlay" onClick={onClose}>
      <div className="form-dialog-content form-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="form-dialog-header">
          <h2>Sửa thông báo</h2>
          <button className="form-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="form-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề<span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter form title"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label>Lớp<span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. 1A, 2B"
            />
            {errors.className && <div className="invalid-feedback">{errors.className}</div>}
          </div>
          <div className="form-group">
            <label>Thể loại<span className="required">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn loại thông báo</option>
              <option value="0">Sức khỏe</option>
              <option value="1">Tiêm chủng</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>
          <div className="form-group">
            <label>Nội dung<span className="required">*</span></label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="8"
              placeholder="Enter form content"
            />
            {errors.content && <div className="invalid-feedback">{errors.content}</div>}
          </div>
          
          <div className="form-dialog-footer">
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
        message="Bạn có chắc chắn muốn cập nhật biểu mẫu này không?"
        confirmText="Cập nhật"
        cancelText="Hủy"
      />
    </div>
  );
};

export default FormEditDialog; 