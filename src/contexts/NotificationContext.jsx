import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notif, setNotifState] = useState(null);
  const timerRef = useRef(null);

  // Clear any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Enhanced setNotif function that supports auto-dismissing
  const setNotif = useCallback((notification) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Set the notification
    setNotifState(notification);

    // If notification is not null and has autoDismiss property, set a timer
    if (notification && (notification.autoDismiss || notification.duration)) {
      const duration = notification.duration || 1500; // Default 1.5 seconds (thay vì 3 seconds)
      timerRef.current = setTimeout(() => {
        setNotifState(null);
      }, duration);
    }
  }, []);

  // Function to clear notification
  const clearNotif = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotifState(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notif, setNotif, clearNotif }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}