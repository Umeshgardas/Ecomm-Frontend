import React, { useState, useEffect } from 'react';
import './ShowNotification.css'; // We'll create this CSS file

const ShowNotification = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  position = 'top-right',
  onClose,
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Icons for different notification types
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  // Colors for different notification types
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };

  // Handle auto-close
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, autoClose]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for exit animation
  };

  // Animation classes based on visibility
  const animationClass = isVisible ? 'notification-enter' : 'notification-exit';

  // Position classes
  const positionClasses = {
    'top-right': 'notification-top-right',
    'top-left': 'notification-top-left',
    'bottom-right': 'notification-bottom-right',
    'bottom-left': 'notification-bottom-left',
    'top-center': 'notification-top-center',
    'bottom-center': 'notification-bottom-center'
  };

  return (
    <div 
      className={`show-notification ${animationClass} ${positionClasses[position] || 'notification-top-right'}`}
      style={{
        backgroundColor: colors[type] || colors.info,
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-content">
        <span className="notification-icon">{icons[type] || icons.info}</span>
        <span className="notification-message">{message}</span>
      </div>
      <button 
        className="notification-close-btn"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
      
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div 
          className="notification-progress-bar"
          style={{
            animationDuration: `${duration}ms`,
            animationName: 'notificationProgress'
          }}
        />
      )}
    </div>
  );
};

// Removed PropTypes since you're using a Vite project without prop-types installed
// You can install prop-types if needed: npm install prop-types

export default ShowNotification;