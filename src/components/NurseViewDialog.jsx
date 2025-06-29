import React from "react";
import "../styles/NurseDialog.css";

const NurseViewDialog = ({ nurse, onClose }) => {
  if (!nurse) return null;

  return (
    <div className="nurse-dialog-overlay" onClick={onClose}>
      <div className="nurse-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="nurse-dialog-header">
          <h2>Nurse Details</h2>
          <button className="nurse-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="nurse-dialog-body">
          <div className="nurse-info-section">
            <h3>Nurse Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nurse ID:</label>
                <span>{nurse.nurseId}</span>
              </div>
              <div className="info-item">
                <label>Full Name:</label>
                <span>{nurse.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{nurse.email}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{nurse.username}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="nurse-dialog-footer">
          <button className="admin-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NurseViewDialog; 