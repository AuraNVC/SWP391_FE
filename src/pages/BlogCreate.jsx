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
      setSuccessMsg("Blog created successfully!");
      setNotif({
        message: "Blog created successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/blog');
      }, 1500);
    } catch (error) {
      const errorMessage = "Failed to create blog. " + (error?.response?.data?.message || error.message);
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
        <h2>Create New Blog</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Back to Blog List
        </button>
      </div>
      
      <div className="blog-create-page-container">
        <form className="blog-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title<span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter blog title"
            />
          </div>
          <div className="form-group">
            <label>Content<span className="required">*</span></label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="10"
              placeholder="Enter blog content"
            />
          </div>
          <div className="form-group">
            <label>Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
            />
            {selectedFile && (
              <div className="file-preview">
                <p>Selected file: {selectedFile.name}</p>
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
              {loading ? "Creating..." : "Create Blog"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={handleCancel}
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

export default BlogCreate; 