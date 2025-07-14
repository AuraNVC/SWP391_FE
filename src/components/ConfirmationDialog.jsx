import React from "react";
import "../styles/ConfirmationDialog.css";

/**
 * Component hiển thị dialog xác nhận hành động
 * @param {boolean} isOpen - Trạng thái hiển thị của dialog
 * @param {function} onClose - Hàm gọi khi đóng dialog
 * @param {function} onConfirm - Hàm gọi khi xác nhận hành động
 * @param {string} title - Tiêu đề dialog
 * @param {string} message - Nội dung thông báo
 * @param {string} confirmText - Text của nút xác nhận
 * @param {string} cancelText - Text của nút hủy
 * @param {string} type - Loại dialog (danger, warning, info)
 */
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "warning"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const getTypeClass = () => {
    switch (type) {
      case "danger":
        return "confirmation-dialog-danger";
      case "warning":
        return "confirmation-dialog-warning";
      case "info":
        return "confirmation-dialog-info";
      default:
        return "";
    }
  };

  return (
    <div className="confirmation-dialog-overlay" onClick={onClose}>
      <div 
        className={`confirmation-dialog-content ${getTypeClass()}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-dialog-header">
          <h3 className="confirmation-dialog-title">{title}</h3>
          <button className="confirmation-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="confirmation-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-footer">
          <button 
            className={`confirmation-dialog-btn ${type === "danger" ? "confirmation-dialog-btn-danger" : "confirmation-dialog-btn-primary"}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="confirmation-dialog-btn confirmation-dialog-btn-secondary" 
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 