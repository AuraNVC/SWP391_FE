import React from "react";
import "../styles/NurseDialog.css";

const NurseViewDialog = ({ nurse, onClose }) => {
  if (!nurse) return null;

  return (
    <div className="nurse-dialog-overlay" onClick={onClose}>
      <div className="nurse-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="nurse-dialog-header">
          <h2>Chi tiết y tá</h2>
          <button className="nurse-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="nurse-dialog-body">
          <div className="nurse-info-section">
            <h3>Thông tin y tá</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã y tá:</label>
                <span>{nurse.nurseId}</span>
              </div>
              <div className="info-item">
                <label>Họ và tên:</label>
                <span>{nurse.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{nurse.email}</span>
              </div>
              <div className="info-item">
                <label>Tên người dùng:</label>
                <span>{nurse.username}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="nurse-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NurseViewDialog; 