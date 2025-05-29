import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaTachometerAlt } from 'react-icons/fa';
import './SpeedTest.css';

const SpeedTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [testDuration, setTestDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && testDuration < 10) {
      interval = setInterval(() => {
        setTestDuration(prev => prev + 1);
        // Simulate speed changes during the test
        setDownloadSpeed(Math.random() * 100);
        setUploadSpeed(Math.random() * 50);
        setPing(Math.random() * 50);
      }, 1000);
    } else if (testDuration >= 10) {
      setIsRunning(false);
      setTestDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, testDuration]);

  const startTest = async () => {
    setIsRunning(true);
    setStatus('Running speed test...');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setTestDuration(0);
    await window.electron.startSpeedTest();
  };

  return (
    <div className="speed-test-container">
      <h2>Network Speed Test</h2>
      <div className="speed-test-cards">
        <div className="speed-card download">
          <FaDownload className="speed-icon" />
          <div className="speed-value">{downloadSpeed.toFixed(2)} <span>Mbps</span></div>
          <div className="speed-label">Download</div>
        </div>
        <div className="speed-card upload">
          <FaUpload className="speed-icon" />
          <div className="speed-value">{uploadSpeed.toFixed(2)} <span>Mbps</span></div>
          <div className="speed-label">Upload</div>
        </div>
        <div className="speed-card ping">
          <FaTachometerAlt className="speed-icon" />
          <div className="speed-value">{ping.toFixed(2)} <span>ms</span></div>
          <div className="speed-label">Ping</div>
        </div>
      </div>
      <div className="status">
        {status}
        {isRunning && <span className="test-progress"> ({testDuration}/10s)</span>}
      </div>
      <button 
        onClick={startTest} 
        disabled={isRunning}
        className="speed-test-button"
      >
        {isRunning ? 'Running Test...' : 'Start Speed Test'}
      </button>
    </div>
  );
};

export default SpeedTest; 