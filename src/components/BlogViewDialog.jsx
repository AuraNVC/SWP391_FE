import React from "react";
import "../styles/BlogDialog.css";

const BlogViewDialog = ({ blog, onClose }) => {
  if (!blog) return null;

  return (
    <div className="blog-dialog-overlay" onClick={onClose}>
      <div className="blog-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="blog-dialog-header">
          <h2>Blog Details</h2>
          <button className="blog-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="blog-dialog-body">
          <div className="blog-info-section">
            <h3>Blog Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Blog ID:</label>
                <span>{blog.blogId}</span>
              </div>
              <div className="info-item">
                <label>Title:</label>
                <span>{blog.title}</span>
              </div>
              <div className="info-item">
                <label>Date Posted:</label>
                <span>{blog.datePosted}</span>
              </div>
            </div>
          </div>
          
          <div className="blog-info-section">
            <h3>Content</h3>
            <div className="blog-content">
              <p>{blog.content}</p>
            </div>
          </div>
          
          {blog.thumbnail && (
            <div className="blog-info-section">
              <h3>Thumbnail</h3>
              <div className="blog-thumbnail">
                <img
                  src={`https://localhost:7024/files/blogs//${blog.thumbnail}`}
                  alt="Blog thumbnail"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="blog-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogViewDialog; 