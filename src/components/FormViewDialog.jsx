import React from "react";
import "../styles/FormDialog.css";

const FormViewDialog = ({ form, onClose }) => {
  console.log("FormViewDialog received form:", form);
  
  if (!form) {
    console.log("FormViewDialog: No form data provided");
    return null;
  }

  return (
    <div className="form-dialog-overlay" onClick={onClose}>
      <div className="form-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="form-dialog-header">
          <h2>Chi tiết thông báo</h2>
          <button className="form-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="form-dialog-body">
          <div className="form-info-section">
            <h3>Thông tin thông báo</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã thông báo:</label>
                <span>{form.formId}</span>
              </div>
              <div className="info-item">
                <label>Tiêu đề:</label>
                <span>{form.title}</span>
              </div>
              <div className="info-item">
                <label>Lớp:</label>
                <span>{form.className}</span>
              </div>
              <div className="info-item">
                <label>Thê loại:</label>
                <span>{form.type}</span>
              </div>
              <div className="info-item">
                <label>Ngày gửi:</label>
                <span>{form.sentDate}</span>
              </div>
              <div className="info-item">
                <label>Ngày đăng:</label>
                <span>{form.createdAt}</span>
              </div>
            </div>
          </div>
          
          <div className="form-info-section">
            <h3>Nội dung</h3>
            <div className="form-content">
              <p>{form.content}</p>
            </div>
          </div>
        </div>
        
        <div className="form-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormViewDialog; 