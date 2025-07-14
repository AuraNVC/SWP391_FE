import React, { useState, useEffect } from "react";
import "../styles/FormDialog.css";
import "../styles/FormCreateForm.css";
import "../styles/FormValidation.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import FormField from "./FormField";
import { validateForm } from "../utils/validation";
import ConfirmationDialog from "./ConfirmationDialog";

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

  const typeOptions = [
    { value: "Health", label: "Sức khỏe" },
    { value: "Permission", label: "Xin phép" },
    { value: "Information", label: "Thông tin" },
    { value: "Other", label: "Khác" }
  ];

  return (
    <div className="form-dialog-overlay" onClick={onClose}>
      <div className="form-dialog-content form-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="form-dialog-header">
          <h2>Chỉnh sửa biểu mẫu</h2>
          <button className="form-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="form-create-form" onSubmit={handleSubmit}>
          <FormField
            label="Tiêu đề"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            error={errors.title}
            placeholder="Nhập tiêu đề biểu mẫu"
          />
          
          <FormField
            label="Lớp"
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
            error={errors.className}
            placeholder="VD: 1A, 2B"
          />
          
          <FormField
            label="Loại biểu mẫu"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            required
            error={errors.type}
            options={typeOptions}
            placeholder="Chọn loại biểu mẫu"
          />
          
          <FormField
            label="Nội dung"
            name="content"
            type="textarea"
            value={formData.content}
            onChange={handleChange}
            required
            error={errors.content}
            placeholder="Nhập nội dung biểu mẫu"
            rows={8}
          />
          
          <div className="form-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật biểu mẫu"}
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