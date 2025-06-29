import React from "react";
import "../styles/ParentDialog.css";

const ParentViewDialog = ({ parent, onClose }) => {
  if (!parent) return null;

  return (
    <div className="parent-dialog-overlay" onClick={onClose}>
      <div className="parent-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="parent-dialog-header">
          <h2>Parent Details</h2>
          <button className="parent-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="parent-dialog-body">
          <div className="parent-info-section">
            <h3>Parent Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Parent ID:</label>
                <span>{parent.parentId}</span>
              </div>
              <div className="info-item">
                <label>Full Name:</label>
                <span>{parent.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{parent.email}</span>
              </div>
              <div className="info-item">
                <label>Phone Number:</label>
                <span>{parent.phoneNumber}</span>
              </div>
              <div className="info-item">
                <label>Address:</label>
                <span>{parent.address || "N/A"}</span>
              </div>
            </div>
          </div>
          
          {parent.students && parent.students.length > 0 && (
            <div className="parent-info-section">
              <h3>Children</h3>
              <div className="students-list">
                {parent.students.map((student, index) => (
                  <div key={student.studentId || index} className="student-item">
                    <div className="student-info">
                      <strong>{student.fullName}</strong>
                      <span>Class: {student.className}</span>
                      <span>Student ID: {student.studentNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="parent-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentViewDialog; 