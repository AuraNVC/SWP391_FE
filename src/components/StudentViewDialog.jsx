import React from "react";
import "../styles/StudentDialog.css";

const StudentViewDialog = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Chi tiết học sinh</h2>
          <button className="student-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="student-dialog-body">
          <div className="student-info-section">
            <h3>Thông tin học sinh</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã số học sinh:</label>
                <span>{student.studentId}</span>
              </div>
              <div className="info-item">
                <label>Họ và tên:</label>
                <span>{student.fullName}</span>
              </div>
              <div className="info-item">
                <label>Giới tính:</label>
                <span>{student.gender}</span>
              </div>
              <div className="info-item">
                <label>Lớp:</label>
                <span>{student.className}</span>
              </div>
              <div className="info-item">
                <label>Tên đăng nhập:</label>
                <span>{student.studentNumber}</span>
              </div>
              <div className="info-item">
                <label>Ngày tháng năm sinh:</label>
                <span>{student.dateOfBirth}</span>
              </div>
            </div>
          </div>
          
          <div className="student-info-section">
            <h3>Thông tin phụ huynh</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Họ và tên:</label>
                <span>{student.parent?.fullName || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{student.parent?.phoneNumber || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{student.parent?.email || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Địa chỉ:</label>
                <span>{student.parent?.address || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="student-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentViewDialog; 