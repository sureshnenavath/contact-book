import React from 'react';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button
      className="dark-mode-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      <span className="toggle-icon">
        {darkMode ? '☀️' : '🌙'}
      </span>
      <span className="toggle-text">
        {darkMode ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default DarkModeToggle;