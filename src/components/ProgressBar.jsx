import React from 'react';

const ProgressBar = ({ percent, status, error }) => {
  return (
    <div className="progress-container" style={{ marginTop: '20px' }}>
      {error ? (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="progress-bar" style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
          <div className="progress-status" style={{
            marginTop: '10px',
            color: '#666',
            fontSize: '14px'
          }}>
            {status || `Progress: ${percent}%`}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressBar; 