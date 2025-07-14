import React from "react";
import "../styles/ParentDialog.css";

const ParentViewDialog = ({ parent, onClose }) => {
  if (!parent) return null;

  return (
    <div className="parent-dialog-overlay" onClick={onClose}>
      <div className="parent-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="parent-dialog-header">
          <h2>Chi tiết phụ huynh</h2>
          <button className="parent-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="parent-dialog-body">
          <div className="parent-info-section">
            <h3>Thông tin phụ huynh</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã phụ huynh:</label>
                <span>{parent.parentId}</span>
              </div>
              <div className="info-item">
                <label>Họ và tên:</label>
                <span>{parent.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{parent.email}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{parent.phoneNumber}</span>
              </div>
              <div className="info-item">
                <label>Địa chỉ:</label>
                <span>{parent.address || "N/A"}</span>
              </div>
            </div>
          </div>
          
          {parent.students && parent.students.length > 0 && (
            <div className="parent-info-section">
              <h3>Học sinh</h3>
              <div className="students-list">
                {parent.students.map((student, index) => (
                  <div key={student.studentId || index} className="student-item">
                    <div className="student-info">
                      <strong>{student.fullName}</strong>
                      <span>Lớp: {student.className}</span>
                      <span>Mã số học sinh: {student.studentNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="parent-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentViewDialog; 