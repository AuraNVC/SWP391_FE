import React, { useState } from "react";
import "../styles/BlogCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from 'react-router-dom';

const initialState = {
  title: "",
  content: "",
  thumbnail: null,
};

const BlogCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setForm((prev) => ({ ...prev, thumbnail: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (selectedFile) {
        formData.append('thumbnail', selectedFile);
      }

      await API_SERVICE.blogAPI.create(formData);
      setSuccessMsg("Tạo blog thành công!");
      setNotif({
        message: "Tạo blog thành công!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/blog');
      }, 1500);
    } catch (error) {
      const errorMessage = "Tạo blog thất bại. " + (error?.response?.data?.message || error.message);
      setErrorMsg(errorMessage);
      setNotif({
        message: errorMessage,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/blog');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Thêm blog mới</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Quay lại danh sách blog
        </button>
      </div>
      
      <div className="blog-create-page-container">
        <form className="blog-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề<span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Nhập tiêu đề blog"
            />
          </div>
          <div className="form-group">
            <label>Nội dung<span className="required">*</span></label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="10"
              placeholder="Nhập nội dung blog"
            />
          </div>
          <div className="form-group">
            <label>Ảnh thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
            />
            {selectedFile && (
              <div className="file-preview">
                <p>Đã chọn: {selectedFile.name}</p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  style={{ maxWidth: 200, maxHeight: 150, marginTop: 10 }}
                />
              </div>
            )}
          </div>
          
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo blog"}
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

export default BlogCreate; 