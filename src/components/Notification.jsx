import React from "react";

const Notification = ({ message, type = "info", onClose }) => {
  if (!message) return null;

  let alertClass = "alert";
  if (type === "success") alertClass += " alert-success";
  else if (type === "error") alertClass += " alert-danger";
  else if (type === "warning") alertClass += " alert-warning";
  else alertClass += " alert-info";

  return (
    <div
      className={alertClass + " alert-dismissible fade show"}
      role="alert"
      style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, minWidth: 250 }}
    >
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
          style={{ float: "right" }}
        ></button>
      )}
    </div>
  );
};

export default Notification;