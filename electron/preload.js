const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      console.log('Sending IPC message:', channel, data);
      ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
      console.log('Registering IPC listener for:', channel);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel) => {
      console.log('Removing IPC listeners for:', channel);
      ipcRenderer.removeAllListeners(channel);
    },
  },
  checkFirstRun: () => {
    console.log('Checking first run...');
    ipcRenderer.send('check-first-run');
  },
  onFirstRunResponse: (callback) => {
    console.log('Setting up first run response listener');
    ipcRenderer.on('first-run-response', callback);
  },
  installVPN: () => ipcRenderer.invoke('run-vpn-script'),
  startSpeedTest: () => ipcRenderer.invoke('start-speed-test'),
  onSpeedTestUpdate: (callback) => ipcRenderer.on('speed-test-update', (event, data) => callback(data)),
  onSpeedTestStart: (callback) => ipcRenderer.on('speed-test-start', (event, data) => callback(data)),
  onVPNProgress: (callback) => ipcRenderer.on('vpn-progress', (event, data) => callback(data)),
  runNetworkDiagnosis: (password) => ipcRenderer.invoke('run-network-diagnosis', password),
  onNetworkDiagnosisProgress: (callback) => ipcRenderer.on('network-diagnosis-progress', (event, data) => callback(data)),
  runOptimizeScript: () => ipcRenderer.invoke('run-optimize-script'),
  onOptimizeProgress: (callback) => ipcRenderer.on('optimize-progress', (event, data) => callback(data)),
  getDeviceStats: async () => {
    const os = require('os');
    const fs = require('fs');
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus().length;
    const cpuModel = os.cpus()[0].model;
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const uptime = (os.uptime() / 60).toFixed(1);
    let disk = 'Not available';
    let battery = 'Not available';
    try {
      if (platform === 'darwin') {
        const { execSync } = require('child_process');
        const out = execSync('df -h /').toString().split('\n')[1];
        if (out) {
          const parts = out.split(/\s+/);
          disk = `${parts[2]} used / ${parts[1]} total`;
        }
        try {
          const batt = execSync('pmset -g batt').toString();
          const match = batt.match(/(\d+)%/);
          if (match) battery = match[1] + '%';
        } catch {}
      } else if (platform === 'win32') {
        const { execSync } = require('child_process');
        const out = execSync('wmic logicaldisk get size,freespace,caption').toString().split('\n')[1];
        if (out) {
          const parts = out.trim().split(/\s+/);
          if (parts.length >= 3) {
            const free = (parseInt(parts[1]) / (1024 ** 3)).toFixed(1);
            const total = (parseInt(parts[2]) / (1024 ** 3)).toFixed(1);
            disk = `${(total - free).toFixed(1)} GB used / ${total} GB total`;
          }
        }
        try {
          const batt = execSync('WMIC PATH Win32_Battery Get EstimatedChargeRemaining').toString();
          const match = batt.match(/(\d+)/);
          if (match) battery = match[1] + '%';
        } catch {}
      }
    } catch {}
    return { platform, arch, cpus, cpuModel, totalMem, freeMem, uptime, disk, battery };
  }
});

console.log('Preload script completed.'); 