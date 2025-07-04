import React, { useEffect, useState } from "react";

const Notification = ({ message, type = "info", onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Reset states when message changes
    if (message) {
      setIsVisible(true);
      setIsFading(false);
    }
  }, [message]);

  useEffect(() => {
    if (!message) return;

    // Start fade out animation before actually removing
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500); // Start fading 500ms before removal

    // Set timer to hide notification
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    // Clean up timers
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [message, duration, onClose]);

  if (!message || !isVisible) return null;

  let alertClass = "alert";
  if (type === "success") alertClass += " alert-success";
  else if (type === "error") alertClass += " alert-danger";
  else if (type === "warning") alertClass += " alert-warning";
  else alertClass += " alert-info";

  const notificationStyle = {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    minWidth: 250,
    transition: "opacity 0.5s ease-out",
    opacity: isFading ? 0 : 1,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px"
  };

  return (
    <div
      className={alertClass + " alert-dismissible fade show"}
      role="alert"
      style={notificationStyle}
    >
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={() => {
            setIsFading(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 500);
          }}
          style={{ float: "right" }}
        ></button>
      )}
    </div>
  );
};

export default Notification;