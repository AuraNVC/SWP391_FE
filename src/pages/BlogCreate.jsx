import React, { useState } from "react";
import "../styles/BlogCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from 'react-router-dom';

const initialState = {
  title: "",
  content: "",
  thumbnail: null,
  category: "",
};

const categoryMap = {
  "": "Chọn chủ đề",
  1: "Dinh dưỡng",
  2: "Tâm lý",
  3: "Bệnh truyền nhiễm",
  4: "Thể chất",
  5: "Gia đình",
  6: "Lợi ích sức khỏe"
};
const categories = Object.entries(categoryMap).map(([value, label]) => ({ value, label }));

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
    setForm((prev) => ({ ...prev, [name]: name === 'category' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setForm((prev) => ({ ...prev, thumbnail: null })); // reset thumbnail, chỉ lưu file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      let thumbnailName = form.thumbnail;
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append('imageFile', selectedFile);
        const res = await API_SERVICE.blogAPI.uploadImage(uploadForm);
        thumbnailName = res.fileName || res.data?.fileName || res.data;
      }
      // Lấy managerId từ localStorage (hoặc context, hoặc hardcode để test)
      const managerId = Number(localStorage.getItem("userId")) ;
      // Lấy ngày hiện tại
      const datePosted = new Date().toISOString().slice(0, 10);
      const payload = {
        managerId,
        title: form.title,
        content: form.content,
        datePosted,
        thumbnail: thumbnailName,
        category: form.category
      };
      await API_SERVICE.blogAPI.create(payload);
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
        <h2>Thêm bài đăng mới</h2>
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
            <label>Chủ đề<span className="required">*</span></label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="form-control"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Ảnh</label>
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