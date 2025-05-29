import React from 'react';
import './Sidebar.css';
import { FaNetworkWired, FaLaptopCode, FaShieldAlt, FaEnvelope, FaTools, FaPrint, FaDesktop, FaRegQuestionCircle, FaRocket, FaUsers } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const Sidebar = ({ selectedSection, onSectionChange }) => {
  const menuItems = [
    {
      id: 'network',
      icon: <FaNetworkWired />,
      title: 'Network',
      description: 'VPN, Speed Test & Connectivity'
    },
    {
      id: 'software',
      icon: <FaLaptopCode />,
      title: 'Software',
      description: 'Installation & Updates'
    },
    {
      id: 'optimization',
      icon: <FaRocket />,
      title: 'Optimization',
      description: 'Device stats & optimization'
    },
    {
      id: 'security',
      icon: <FaShieldAlt />,
      title: 'Security',
      description: 'Antivirus & System Security'
    },
    {
      id: 'email',
      icon: <FaEnvelope />,
      title: 'Email',
      description: 'Setup & Troubleshooting'
    },
    {
      id: 'hardware',
      icon: <FaTools />,
      title: 'Hardware',
      description: 'Device & Peripheral Issues'
    },
    {
      id: 'printer',
      icon: <FaPrint />,
      title: 'Printer',
      description: 'Printer Setup & Issues'
    },
    {
      id: 'remote',
      icon: <FaDesktop />,
      title: 'Remote Access',
      description: 'Remote Desktop & Support'
    },
    {
      id: 'it-warriors',
      icon: <FaUsers />,
      title: 'IT Warriors',
      description: 'Meet your IT team'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="IT Sahayak Logo" style={{ width: 80, display: 'block', margin: '0 auto 1rem' }} />
        <h1>IT Sahayak</h1>
        <p>Your IT Support Assistant</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${selectedSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-text">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="support-info">
          <p>Need help?</p>
          <a href="mailto:ithelpdesk@pw.live">ithelpdesk@pw.live</a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 