import React from "react";
import "../styles/HealthCheckScheduleDialog.css";

const VaccinationScheduleViewDialog = ({ open, onClose, data }) => {
  if (!open || !data) return null;
  return (
    <div className="student-dialog-overlay" onClick={onClose}>
      <div className="student-dialog-content" onClick={e => e.stopPropagation()}>
        <div className="student-dialog-header">
          <h2>Chi tiết lịch tiêm chủng</h2>
          <button className="student-dialog-close" onClick={onClose}> 7</button>
        </div>
        <div className="student-dialog-body">
          <div className="info-grid">
            <div className="info-item"><label>ID:</label><span>{data.vaccinationScheduleId}</span></div>
            <div className="info-item"><label>Tên:</label><span>{data.name}</span></div>
            <div className="info-item"><label>Ngày tiêm:</label><span>{data.scheduleDate}</span></div>
            <div className="info-item"><label>Địa điểm:</label><span>{data.location}</span></div>
            <div className="info-item"><label>Ghi chú:</label><span>{data.note}</span></div>
          </div>
        </div>
        <div className="student-dialog-footer">
          <button className="admin-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default VaccinationScheduleViewDialog; 