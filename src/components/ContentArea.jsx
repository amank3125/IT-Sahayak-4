import React, { useState, useEffect } from 'react';
import './ContentArea.css';
import ProgressBar from './ProgressBar';
import SpeedTest from './SpeedTest';
import { FaNetworkWired, FaLaptopCode, FaShieldAlt, FaEnvelope, FaTools, FaPrint, FaDesktop, FaKey, FaLock, FaPaperclip, FaWindows, FaApple, FaRegQuestionCircle, FaMicrochip, FaMemory, FaHdd, FaBatteryHalf, FaClock } from 'react-icons/fa';
import Modal from 'react-modal';

const ContentArea = ({ selectedSection }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [diagnosisProgress, setDiagnosisProgress] = useState([]);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const [diagnosisDone, setDiagnosisDone] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [diagnosisPassword, setDiagnosisPassword] = useState('');
  const [pendingDiagnosis, setPendingDiagnosis] = useState(false);
  const [deviceStats, setDeviceStats] = useState({});
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeLog, setOptimizeLog] = useState([]);
  const [optimizeDone, setOptimizeDone] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showMoreSoftwareModal, setShowMoreSoftwareModal] = useState(false);

  const hardwareOptions = [
    {
      id: 'keyboard',
      icon: '⌨️',
      title: 'Keyboard Issues',
      description: 'Troubleshoot keyboard problems',
      url: 'https://support.microsoft.com/en-us/windows/keyboard-troubleshooting-f8be5b8a-99bc-22e9-3144-6bf1494f18e1'
    },
    {
      id: 'mouse',
      icon: '🖱️',
      title: 'Mouse Problems',
      description: 'Fix mouse and touchpad issues',
      url: 'https://support.microsoft.com/en-us/windows/mouse-problems-in-windows-d90ee50a-fa52-0b19-4e60-8d94-e94a5b2e8e3f'
    },
    {
      id: 'display',
      icon: '🖥️',
      title: 'Display Issues',
      description: 'Resolve screen and monitor problems',
      url: 'https://support.microsoft.com/en-us/windows/troubleshoot-display-problems-in-windows-3abdf6a1-46e5-40fb-837f-1e955be62f3b'
    },
    {
      id: 'audio',
      icon: '🔊',
      title: 'Audio Problems',
      description: 'Fix sound and audio issues',
      url: 'https://support.microsoft.com/en-us/windows/fix-sound-problems-in-windows-73025246-b61c-40fb-671a-2535c7cd56c8'
    }
  ];

  const softwareLicenseOptions = [
    {
      id: 'office365',
      icon: '📊',
      title: 'Office 365',
      description: 'Manage Microsoft Office licenses',
      url: 'https://admin.microsoft.com/Adminportal/Home#/licenses'
    },
    {
      id: 'adobe',
      icon: '🎨',
      title: 'Adobe Creative Cloud',
      description: 'Manage Adobe CC licenses',
      url: 'https://adminconsole.adobe.com/licenses'
    },
    {
      id: 'windows',
      icon: '🪟',
      title: 'Windows License',
      description: 'Windows activation and licensing',
      url: 'https://www.microsoft.com/licensing/servicecenter'
    }
  ];

  const softwareOptions = [
    {
      id: 'anydesk-mac',
      icon: <img src="anydesk.png" alt="Anydesk" style={{ width: 24, height: 24 }} />,
      title: 'Anydesk (macOS)',
      description: 'Remote desktop access software for macOS',
      url: 'https://aksdev.s3.ap-south-1.amazonaws.com/anydesk.dmg'
    },
    {
      id: 'anydesk-windows',
      icon: <img src="anydesk.png" alt="Anydesk" style={{ width: 24, height: 24 }} />,
      title: 'Anydesk (Windows)',
      description: 'Remote desktop access software for Windows',
      url: 'https://aksdev.s3.ap-south-1.amazonaws.com/AnyDesk.exe'
    },
    {
      id: 'wps-office',
      icon: <img src="wps.png" alt="WPS Office" style={{ width: 24, height: 24 }} />,
      title: 'WPS Office',
      description: 'Free office suite for documents, spreadsheets, and presentations',
      url: 'https://www.wps.com/download/'
    },
    {
      id: 'chrome',
      icon: <img src="chrome.png" alt="Chrome" style={{ width: 24, height: 24 }} />,
      title: 'Chrome',
      description: 'Google Chrome browser',
      url: 'https://www.google.com/chrome/'
    }
  ];

  const printerOptions = [
    {
      id: 'printer-windows',
      icon: <FaWindows style={{ color: '#0078D6', fontSize: 24 }} />,
      title: 'Install Printer (Windows)',
      description: 'Xerox Smart Start Printer Installation for Windows',
      url: 'https://aksdev.s3.ap-south-1.amazonaws.com/XeroxSmartStart_2.1.22.0.exe'
    },
    {
      id: 'printer-mac',
      icon: <FaApple style={{ color: '#000', fontSize: 24 }} />,
      title: 'Install Printer (macOS)',
      description: 'Xerox Printer Installation for macOS',
      url: 'macappstore://itunes.apple.com/app/id6443456959'
    }
  ];

  const emailOptions = [
    {
      id: 'forgot-password',
      icon: <FaKey style={{ color: '#4CAF50', fontSize: 24 }} />,
      title: 'Forgot Password',
      description: 'Reset your email password',
      url: 'mailto:atul.pandey@pw.live?subject=Forgot%20Password%20Request'
    },
    {
      id: '2fa-issues',
      icon: <FaLock style={{ color: '#4CAF50', fontSize: 24 }} />,
      title: '2FA Issues',
      description: 'Troubleshoot two-factor authentication',
      url: 'mailto:atul.pandey@pw.live?subject=2FA%20Issues'
    },
    {
      id: 'attachment-issues',
      icon: <FaPaperclip style={{ color: '#4CAF50', fontSize: 24 }} />,
      title: 'Attachment Issues',
      description: 'Report external attachment issues',
      url: 'https://pw.jotform.com/232332420866957'
    }
  ];

  const menuIcons = {
    network: <FaNetworkWired />,
    software: <FaLaptopCode />,
    security: <FaShieldAlt />,
    email: <FaEnvelope />,
    hardware: <FaTools />,
    printer: <FaPrint />,
    remote: <FaDesktop />,
    'software-licenses': <FaRegQuestionCircle />
  };

  useEffect(() => {
    const handleProgress = (data) => {
      switch (data.type) {
        case 'progress':
          setProgress(data.percent);
          break;
        case 'status':
          setStatus(data.message);
          break;
        case 'error':
          setError(data.message);
          setIsInstalling(false);
          break;
      }
    };

    window.electron.onVPNProgress(handleProgress);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('vpn-progress');
    };
  }, []);

  useEffect(() => {
    if (!window.electron) return;
    const handler = (data) => {
      if (data.type === 'progress') {
        setDiagnosisProgress(prev => [...prev, data.message]);
      } else if (data.type === 'error') {
        setDiagnosisProgress(prev => [...prev, '[ERROR] ' + data.message]);
        setDiagnosisRunning(false);
      } else if (data.type === 'done') {
        setDiagnosisRunning(false);
        setDiagnosisDone(true);
      }
    };
    window.electron.onNetworkDiagnosisProgress(handler);
    return () => {
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('network-diagnosis-progress');
      }
    };
  }, []);

  const startNetworkDiagnosis = async () => {
    setDiagnosisProgress([]);
    setDiagnosisRunning(true);
    setDiagnosisDone(false);
    if (navigator.userAgent.includes('Macintosh')) {
      setShowPasswordModal(true);
      setPendingDiagnosis(true);
      return;
    }
    await window.electron.runNetworkDiagnosis();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setShowPasswordModal(false);
    setPendingDiagnosis(false);
    setDiagnosisRunning(true);
    setDiagnosisDone(false);
    await window.electron.runNetworkDiagnosis(diagnosisPassword);
    setDiagnosisPassword('');
  };

  const handleStartSpeedTest = () => {
    setShowSpeedTest(true);
    setIframeKey(prev => prev + 1); // force iframe reload
  };

  const renderEmailContent = () => (
    <div className="content-section">
      <h2>Email Support</h2>
      <div className="action-buttons">
        {emailOptions.map(option => (
          <button
            key={option.id}
            className="action-button"
            onClick={() => window.open(option.url, '_blank')}
          >
            <span className="action-icon">{option.icon}</span>
            <div className="action-text">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSecurityContent = () => (
    <div className="content-section">
      <h2>Security</h2>
      <div className="coming-soon">
        <h3>Coming Soon</h3>
        <p>Security features are under development. Check back later for updates.</p>
      </div>
    </div>
  );

  const renderHardwareContent = () => (
    <div className="content-section">
      <h2>Hardware Support</h2>
      <div className="coming-soon">
        <h3>Coming Soon</h3>
        <p>Hardware support features are under development. Check back later for updates.</p>
      </div>
    </div>
  );

  const renderNetworkContent = () => (
    <div className="content-section">
      <h2>Network Issues</h2>
      <div className="action-buttons">
        <button 
          className="action-button" 
          onClick={() => {
            setActiveAction('vpn');
            setIsInstalling(true);
            setError('');
            window.electron.installVPN();
          }}
          disabled={isInstalling}
        >
          <span className="action-icon">🔒</span>
          <div className="action-text">
            <h4>Install VPN</h4>
            <p>Set up secure VPN connection</p>
          </div>
        </button>
        <button 
          className="action-button"
          onClick={startNetworkDiagnosis}
          disabled={diagnosisRunning}
        >
          <span className="action-icon">🩺</span>
          <div className="action-text">
            <h4>Network Diagnosis</h4>
            <p>Run a full network diagnostic and reset</p>
          </div>
        </button>
        <button
          className="action-button"
          onClick={handleStartSpeedTest}
          disabled={showSpeedTest}
        >
          <span className="action-icon">⚡</span>
          <div className="action-text">
            <h4>Speed Test</h4>
            <p>Check your network speed</p>
          </div>
        </button>
      </div>
      <div className="action-content">
        {activeAction === 'vpn' && (isInstalling || progress > 0) && (
          <ProgressBar 
            percent={progress} 
            status={status}
            error={error}
          />
        )}
        {diagnosisRunning && (
          <div className="diagnostics-content">
            <h3>Network Diagnosis Progress</h3>
            <pre style={{ textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>{diagnosisProgress.join('\n')}</pre>
            <p style={{ color: '#888' }}>Running...</p>
          </div>
        )}
        {diagnosisDone && !diagnosisRunning && (
          <div className="diagnostics-content">
            <h3>Network Diagnosis Progress</h3>
            <pre style={{ textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>{diagnosisProgress.join('\n')}</pre>
            <p style={{ color: '#4CAF50', fontWeight: 600 }}>Completed</p>
          </div>
        )}
        {showSpeedTest && (
          <div style={{ marginTop: 32, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <iframe
              key={iframeKey}
              src="https://openspeedtest.com/Get-widget.php?theme=light"
              title="Network Speed Test"
              style={{ width: '100%', maxWidth: 900, height: 600, border: 'none', borderRadius: 16, boxShadow: '0 2px 16px rgba(44,62,80,0.08)' }}
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSoftwareLicensesContent = () => (
    <div className="content-section">
      <h2>Software License Management</h2>
      <div className="action-buttons">
        {softwareLicenseOptions.map(option => (
          <button
            key={option.id}
            className="action-button"
            onClick={() => window.open(option.url, '_blank')}
          >
            <span className="action-icon">{option.icon}</span>
            <div className="action-text">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSoftwareContent = () => (
    <div className="content-section">
      <h2>Software Installation</h2>
      <div className="action-buttons">
        {softwareOptions.map(option => (
          <button
            key={option.id}
            className="action-button"
            onClick={() => window.open(option.url, '_blank')}
          >
            <span className="action-icon">{option.icon}</span>
            <div className="action-text">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
          </button>
        ))}
        <button
          className="action-button"
          style={{ background: '#f3f4f6', color: '#222', border: '1px solid #e5e7eb', fontWeight: 600 }}
          onClick={() => setShowMoreSoftwareModal(true)}
        >
          <span className="action-icon">➕</span>
          <div className="action-text">
            <h4>More</h4>
            <p>See more software options</p>
          </div>
        </button>
      </div>
      <Modal
        isOpen={showMoreSoftwareModal}
        onRequestClose={() => setShowMoreSoftwareModal(false)}
        contentLabel="More Software"
        ariaHideApp={false}
        style={{ content: { maxWidth: 800, height: 600, margin: 'auto', padding: 0, borderRadius: 12, overflow: 'hidden' } }}
      >
        <iframe
          src="https://pw.jotform.com/231751320990049/"
          title="More Software Options"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Modal>
    </div>
  );

  const renderPrinterContent = () => (
    <div className="content-section">
      <h2>Printer Setup</h2>
      <div className="action-buttons">
        {printerOptions.map(option => (
          <button
            key={option.id}
            className="action-button"
            onClick={() => window.open(option.url, '_blank')}
          >
            <span className="action-icon">{option.icon}</span>
            <div className="action-text">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderRemoteContent = () => (
    <div className="content-section">
      <h2>Remote Support</h2>
      <div className="coming-soon">
        <h3>Coming Soon</h3>
        <p>Remote support features are under development. Check back later for updates.</p>
      </div>
    </div>
  );

  const renderOptimizationContent = () => (
    <div className="content-section">
      <h2>Device Optimization</h2>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <FaDesktop size={32} color="#4CAF50" />
          <div>
            <div style={{ fontWeight: 600 }}>Platform</div>
            <div>{deviceStats.platform} ({deviceStats.arch})</div>
          </div>
        </div>
        <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <FaMicrochip size={32} color="#2196F3" />
          <div>
            <div style={{ fontWeight: 600 }}>CPU</div>
            <div>{deviceStats.cpuModel} ({deviceStats.cpus} cores)</div>
          </div>
        </div>
        <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <FaMemory size={32} color="#FFC107" />
          <div>
            <div style={{ fontWeight: 600 }}>RAM</div>
            <div>{deviceStats.freeMem} GB free / {deviceStats.totalMem} GB total</div>
          </div>
        </div>
        {deviceStats.disk && (
          <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <FaHdd size={32} color="#9C27B0" />
            <div>
              <div style={{ fontWeight: 600 }}>Storage</div>
              <div>{deviceStats.disk}</div>
            </div>
          </div>
        )}
        {deviceStats.battery && (
          <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <FaBatteryHalf size={32} color="#FF5722" />
            <div>
              <div style={{ fontWeight: 600 }}>Battery</div>
              <div>{deviceStats.battery}</div>
            </div>
          </div>
        )}
        <div style={{ flex: '1 1 200px', background: '#f8f9fa', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <FaClock size={32} color="#607D8B" />
          <div>
            <div style={{ fontWeight: 600 }}>Uptime</div>
            <div>{deviceStats.uptime} min</div>
          </div>
        </div>
      </div>
      <button
        className="optimise-fullwidth"
        onClick={startOptimize}
        disabled={optimizing}
      >
        <span className="action-icon" style={{ fontSize: 32, marginRight: 16 }}>🚀</span>
        <div className="action-text">
          <h4 style={{ margin: 0, fontSize: '1.3rem' }}>Optimize Device</h4>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 400 }}>Clean up temp files and optimize system</p>
        </div>
      </button>
      <div className="action-content">
        {optimizing && (
          <div className="diagnostics-content">
            <h3>Optimization Progress</h3>
            <pre style={{ textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>{optimizeLog.join('\n')}</pre>
            <p style={{ color: '#888' }}>Running...</p>
          </div>
        )}
        {optimizeDone && !optimizing && (
          <div className="diagnostics-content">
            <h3>Optimization Progress</h3>
            <pre style={{ textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>{optimizeLog.join('\n')}</pre>
            <p style={{ color: '#4CAF50', fontWeight: 600 }}>Completed</p>
          </div>
        )}
      </div>
    </div>
  );

  const itWarriors = [
    { id: 'PW4816', name: 'Kushal Giri', department: 'GSuite Admin', email: 'Kushal.giri@pw.live', avatar: 'team/kushal.png' },
    { id: 'PW1525', name: 'Aman Kumar', department: 'IT Operations', email: 'Aman.kumar3@pw.live', avatar: 'team/aman.kumar3.png' },
    { id: 'PW11957', name: 'Akash Kumar', department: 'EIS', email: 'Akash.kumar12@pw.live', avatar: 'team/akash.kumar12.png' },
    { id: 'PW13315', name: 'Amit Bisht', department: 'EIS', email: 'Amit.bisht@pw.live', avatar: 'team/amit.bisht.png' },
    { id: 'PW18830', name: 'Tuhin Das', department: 'IT Network Operations', email: 'Tuhin.das1@pw.live', avatar: 'avatars/tuhin.das1.png' },
    { id: 'PW4175', name: 'Kunal Raj', department: 'IT Support Engineer', email: 'kunal.raj@pw.live', avatar: 'avatars/kunal.raj.png' },
  ];

  const fallbackAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  const renderITWarriorsContent = () => (
    <div className="content-section">
      <h2>IT Warriors</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        {itWarriors.map(user => (
          <div
            key={user.id}
            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
            style={{
              background: '#f8f9fa',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
              padding: 24,
              minWidth: 220,
              maxWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4CAF50')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
          >
            <img
              src={user.avatar}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }}
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar; }}
            />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{user.name}</div>
            <div style={{ color: '#888', fontWeight: 500, marginBottom: 4 }}>Emp Code: {user.id}</div>
            <div style={{ color: '#4CAF50', fontWeight: 500, marginBottom: 8 }}>{user.department}</div>
            <div style={{ color: '#1a56db', textDecoration: 'none', fontWeight: 500 }}>{user.email}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'network':
        return renderNetworkContent();
      case 'hardware':
        return renderHardwareContent();
      case 'software-licenses':
        return renderSoftwareLicensesContent();
      case 'software':
        return renderSoftwareContent();
      case 'printer':
        return renderPrinterContent();
      case 'email':
        return renderEmailContent();
      case 'security':
        return renderSecurityContent();
      case 'vpn':
        return (
          <div className="vpn-section">
            <h2>VPN Installation</h2>
            <button 
              onClick={() => {
                setIsInstalling(true);
                setError('');
                window.electron.installVPN();
              }}
              disabled={isInstalling}
            >
              {isInstalling ? 'Installing...' : 'Install VPN'}
            </button>
            {(isInstalling || progress > 0) && (
              <ProgressBar 
                percent={progress} 
                status={status}
                error={error}
              />
            )}
          </div>
        );
      case 'remote':
        return renderRemoteContent();
      case 'optimization':
        return renderOptimizationContent();
      case 'it-warriors':
        return renderITWarriorsContent();
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  useEffect(() => {
    if (selectedSection === 'optimization' && window.electron && window.electron.getDeviceStats) {
      window.electron.getDeviceStats().then(setDeviceStats);
    }
  }, [selectedSection]);

  const startOptimize = async () => {
    setOptimizing(true);
    setOptimizeLog([]);
    setOptimizeDone(false);
    await window.electron.runOptimizeScript();
  };

  useEffect(() => {
    if (!window.electron) return;
    const handler = (data) => {
      if (data.type === 'progress') {
        setOptimizeLog(prev => [...prev, data.message]);
      } else if (data.type === 'done') {
        setOptimizing(false);
        setOptimizeDone(true);
      } else if (data.type === 'error') {
        setOptimizeLog(prev => [...prev, '[ERROR] ' + data.message]);
        setOptimizing(false);
      }
    };
    window.electron.onOptimizeProgress(handler);
    return () => {
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('optimize-progress');
      }
    };
  }, []);

  return (
    <div className="content-area">
      {renderContent()}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
        contentLabel="Enter Password"
        ariaHideApp={false}
        style={{ content: { maxWidth: 400, margin: 'auto', padding: '2rem', borderRadius: 8 } }}
      >
        <h2>Enter your device password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={diagnosisPassword}
            onChange={e => setDiagnosisPassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', padding: '0.75rem', margin: '1rem 0', borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" style={{ background: '#4CAF50', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' }}>
            Start Diagnosis
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ContentArea; 