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
          <h2>Form Details</h2>
          <button className="form-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="form-dialog-body">
          <div className="form-info-section">
            <h3>Form Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Form ID:</label>
                <span>{form.formId}</span>
              </div>
              <div className="info-item">
                <label>Title:</label>
                <span>{form.title}</span>
              </div>
              <div className="info-item">
                <label>Class:</label>
                <span>{form.className}</span>
              </div>
              <div className="info-item">
                <label>Type:</label>
                <span>{form.type}</span>
              </div>
              <div className="info-item">
                <label>Sent Date:</label>
                <span>{form.sentDate}</span>
              </div>
              <div className="info-item">
                <label>Created At:</label>
                <span>{form.createdAt}</span>
              </div>
            </div>
          </div>
          
          <div className="form-info-section">
            <h3>Content</h3>
            <div className="form-content">
              <p>{form.content}</p>
            </div>
          </div>
        </div>
        
        <div className="form-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormViewDialog; 