import React, { useState } from "react";
import "../styles/FormCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from 'react-router-dom';

const initialState = {
  title: "",
  className: "",
  type: "",
  content: "",
};

const FormCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { setNotif } = useNotification();
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Lấy danh sách student theo className
      const response = await API_SERVICE.studentAPI.getAll({ keyword: `${form.className}` });
      console.log("Student response:", response);

      // Lấy parentId từ tất cả student trong response
      const parentIds = response
        .map(student => Number(student.parent.parentId))
        .filter(id => Number.isInteger(id) && id > 0);
      console.log("Parent IDs:", parentIds);

      const payload = {
        title: form.title,
        className: form.className,
        type: Number(form.type),
        sentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        content: form.content,
        parentIds: parentIds,
      };
      console.log("Form payload:", payload);

      await API_SERVICE.formAPI.create(payload);
      setSuccessMsg("Tạo biểu mẫu thành công!");
      setNotif({
        message: "Tạo biểu mẫu thành công!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/form');
      }, 1500);
    } catch (error) {
      const errorMessage = "Tạo biểu mẫu thất bại. " + (error?.response?.data?.message || error.message);
      setErrorMsg(errorMessage);
      setNotif({
        message: errorMessage,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/form');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Thêm biểu mẫu mới</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Quay lại danh sách biểu mẫu
        </button>
      </div>

      <div className="form-create-page-container">
        <form className="form-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề<span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Nhập tiêu đề biểu mẫu"
            />
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
              placeholder="VD: 1A, 2B"
            />
          </div>
          <div className="form-group">
            <label>Loại<span className="required">*</span></label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn loại biểu mẫu</option>
              <option value="0">Biểu mẫu khám sức khỏe</option>
              <option value="1">Biểu mẫu tiêm chủng</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nội dung<span className="required">*</span></label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="8"
              placeholder="Nhập nội dung biểu mẫu"
            />
          </div>

          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo biểu mẫu"}
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

export default FormCreate;