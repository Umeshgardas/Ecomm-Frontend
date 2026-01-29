import React, { createContext, useContext, useState, useCallback } from "react";
import ShowNotification from "../components/ShowNofication";

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, options = {}) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type: options.type || "info",
      duration: options.duration || 3000,
      position: options.position || "top-right",
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove if autoClose is true (default)
    if (options.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, removeNotification, clearAllNotifications }}
    >
      {children}

      {/* Render all active notifications */}
      {notifications.map((notification) => (
        <ShowNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          position={notification.position}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
