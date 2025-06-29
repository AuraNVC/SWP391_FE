import React from "react";
import "../styles/StudentDialog.css";

const StudentViewDialog = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Student Details</h2>
          <button className="student-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="student-dialog-body">
          <div className="student-info-section">
            <h3>Student Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Student ID:</label>
                <span>{student.studentId}</span>
              </div>
              <div className="info-item">
                <label>Full Name:</label>
                <span>{student.fullName}</span>
              </div>
              <div className="info-item">
                <label>Gender:</label>
                <span>{student.gender}</span>
              </div>
              <div className="info-item">
                <label>Class:</label>
                <span>{student.className}</span>
              </div>
              <div className="info-item">
                <label>Student Number:</label>
                <span>{student.studentNumber}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{student.dateOfBirth}</span>
              </div>
            </div>
          </div>
          
          <div className="student-info-section">
            <h3>Parent Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Parent Name:</label>
                <span>{student.parent?.fullName || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Parent Phone:</label>
                <span>{student.parent?.phoneNumber || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Parent Email:</label>
                <span>{student.parent?.email || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Parent Address:</label>
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