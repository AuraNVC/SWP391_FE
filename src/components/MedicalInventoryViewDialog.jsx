import React from "react";
import "../styles/BlogDialog.css";

const MedicalInventoryViewDialog = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="blog-dialog-overlay" onClick={onClose}>
      <div className="blog-dialog-content" onClick={e => e.stopPropagation()}>
        <div className="blog-dialog-header">
          <h2>Chi tiết vật tư y tế</h2>
          <button className="blog-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="blog-dialog-body">
          <div className="blog-info-section">
            <div className="info-grid">
              <div className="info-item"><label>Mã vật tư:</label> <span>{item.medicalInventoryId}</span></div>
              <div className="info-item"><label>Mã quản lý:</label> <span>{item.managerId}</span></div>
              <div className="info-item"><label>Tên vật tư:</label> <span>{item.medicalName}</span></div>
              <div className="info-item"><label>Số lượng:</label> <span>{item.quantity}</span></div>
              <div className="info-item"><label>Đơn vị:</label> <span>{item.unit}</span></div>
              <div className="info-item"><label>Ngày nhập:</label> <span>{item.dateAdded}</span></div>
              <div className="info-item"><label>Hạn sử dụng:</label> <span>{item.expiryDate}</span></div>
            </div>
          </div>
        </div>
        <div className="blog-dialog-footer">
          <button className="admin-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalInventoryViewDialog; 