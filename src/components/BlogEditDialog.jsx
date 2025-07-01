import React, { useState, useEffect } from "react";
import "../styles/BlogDialog.css";
import "../styles/BlogCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const BlogEditDialog = ({ blog, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { setNotif } = useNotification();

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || "",
        content: blog.content || "",
      });
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (selectedFile) {
        formData.append('thumbnail', selectedFile);
      }

      await API_SERVICE.blogAPI.update(blog.blogId, formData);
      setNotif({
        message: "Cập nhật blog thành công!",
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setNotif({
        message: `Cập nhật blog thất bại. ${error?.response?.data?.message || error.message}`,
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!blog) return null;

  return (
    <div className="blog-dialog-overlay" onClick={onClose}>
      <div className="blog-dialog-content blog-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="blog-dialog-header">
          <h2>Sửa Blog</h2>
          <button className="blog-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
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
              rows="8"
              placeholder="Nhập nội dung blog"
            />
          </div>
          <div className="form-group">
            <label>Ảnh thumbnail mới (không bắt buộc)</label>
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
            {blog.thumbnail && !selectedFile && (
              <div className="current-thumbnail">
                <p>Ảnh thumbnail hiện tại:</p>
                <img
                  src={`https://localhost:7024/files/blogs//${blog.thumbnail}`}
                  alt="Current thumbnail"
                  style={{ maxWidth: 200, maxHeight: 150, marginTop: 10 }}
                />
              </div>
            )}
          </div>
          
          <div className="blog-dialog-footer">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật Blog"}
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

export default BlogEditDialog; 