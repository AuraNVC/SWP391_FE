import React, { useState, useEffect } from "react";
import "../styles/FormDialog.css";
import "../styles/FormCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const FormEditDialog = ({ form, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    className: "",
    type: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        message: "Form updated successfully!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Failed to update form. ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!form) return null;

  return (
    <div className="form-dialog-overlay" onClick={onClose}>
      <div className="form-dialog-content form-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="form-dialog-header">
          <h2>Edit Form</h2>
          <button className="form-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form className="form-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title<span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter form title"
            />
          </div>
          <div className="form-group">
            <label>Class<span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. 1A, 2B"
            />
          </div>
          <div className="form-group">
            <label>Type<span className="required">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select form type</option>
              <option value="Health">Health</option>
              <option value="Permission">Permission</option>
              <option value="Information">Information</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Content<span className="required">*</span></label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="8"
              placeholder="Enter form content"
            />
          </div>
          
          <div className="form-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Form"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditDialog; 