const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

// Simple development mode check
const isDev = process.env.NODE_ENV === 'development';

// Python interpreter path
const PYTHON_PATH = '/Library/Frameworks/Python.framework/Versions/3.13/bin/python3';

// Store the main window as a global reference to prevent garbage collection
let mainWindow = null;

async function waitForViteServer() {
  return new Promise((resolve) => {
    const checkServer = async () => {
      // Try ports from 5173 to 5183
      for (let port = 5173; port <= 5183; port++) {
        try {
          const response = await fetch(`http://localhost:${port}`);
          if (response.ok) {
            resolve(port);
            return;
          }
        } catch (e) {
          // Port not responding, try next one
          continue;
        }
      }
      // If no port found, wait and try again
      setTimeout(checkServer, 1000);
    };
    checkServer();
  });
}

async function createWindow() {
  let port = 5173;
  
  if (isDev) {
    console.log('Waiting for Vite server...');
    port = await waitForViteServer();
    console.log(`Found Vite server on port ${port}`);
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // In production, use the built files
  const loadURL = isDev
    ? `http://localhost:${port}`
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  console.log('Loading URL:', loadURL);

  try {
    // For production, we need to wait a bit for the window to be ready
    if (!isDev) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await mainWindow.loadURL(loadURL);
    console.log('Window loaded successfully');
  } catch (error) {
    console.error('Failed to load window:', error);
    // Try loading with a different path in production
    if (!isDev) {
      try {
        const altPath = `file://${path.resolve(__dirname, '../dist/index.html')}`;
        console.log('Trying alternative path:', altPath);
        await mainWindow.loadURL(altPath);
      } catch (err) {
        console.error('Failed to load alternative path:', err);
      }
    }
  }

  // Open the DevTools in development.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Handle IPC messages here
  ipcMain.on('check-first-run', (event) => {
    // Check if the window exists and is not destroyed
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('first-run-response', true);
    }
  });

  // Handle VPN script execution
  ipcMain.handle('run-vpn-script', () => {
    return new Promise((resolve, reject) => {
      const scriptPath = isDev
        ? path.join(__dirname, '../scripts/vpn_script.py')
        : path.join(process.resourcesPath, 'scripts/vpn_script.py');
      const pythonProcess = spawn(PYTHON_PATH, [scriptPath]);
      
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        // Send progress updates to renderer
        if (output.startsWith('PROGRESS')) {
          const percent = parseInt(output.split(' ')[1]);
          mainWindow.webContents.send('vpn-progress', { type: 'progress', percent });
        } else if (output.startsWith('STATUS')) {
          const message = output.substring(7);
          mainWindow.webContents.send('vpn-progress', { type: 'status', message });
        } else if (output.startsWith('ERROR')) {
          const error = output.substring(6);
          mainWindow.webContents.send('vpn-progress', { type: 'error', message: error });
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        mainWindow.webContents.send('vpn-progress', { type: 'error', message: error });
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          reject({ success: false });
        }
      });
    });
  });

  // Handle Speed Test script execution
  ipcMain.handle('run-speed-test', () => {
    return new Promise((resolve, reject) => {
      const scriptPath = isDev
        ? path.join(__dirname, '../scripts/network_speed.py')
        : path.join(process.resourcesPath, 'scripts/network_speed.py');
      const pythonProcess = spawn(PYTHON_PATH, [scriptPath]);
      
      let error = '';

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          reject({ success: false, error });
        }
      });
    });
  });

  // Speed Test Handler
  ipcMain.handle('start-speed-test', async () => {
    return new Promise((resolve) => {
      mainWindow.webContents.send('speed-test-update', { 
        type: 'status',
        message: 'Starting speed test...'
      });

      // We'll use the browser's fetch API to test download speed
      mainWindow.webContents.send('speed-test-start');
    });
  });

  // Handle Network Diagnosis script execution
  ipcMain.handle('run-network-diagnosis', (event, password) => {
    return new Promise((resolve, reject) => {
      const scriptPath = isDev
        ? path.join(__dirname, '../scripts/net_diagnosis.py')
        : path.join(process.resourcesPath, 'scripts/net_diagnosis.py');
      const pythonProcess = spawn(PYTHON_PATH, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

      if (password) {
        // Write the password to stdin for sudo
        pythonProcess.stdin.write(password + '\n');
        pythonProcess.stdin.end();
      }

      pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            mainWindow.webContents.send('network-diagnosis-progress', { type: 'progress', message: line });
          }
        });
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        mainWindow.webContents.send('network-diagnosis-progress', { type: 'error', message: error });
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          mainWindow.webContents.send('network-diagnosis-progress', { type: 'done' });
          resolve({ success: true });
        } else {
          mainWindow.webContents.send('network-diagnosis-progress', { type: 'error', message: 'Diagnosis script failed.' });
          reject({ success: false });
        }
      });
    });
  });

  // Handle optimize script execution
  ipcMain.handle('run-optimize-script', (event) => {
    return new Promise((resolve, reject) => {
      const scriptPath = isDev
        ? path.join(__dirname, '../scripts/optimize.py')
        : path.join(process.resourcesPath, 'scripts/optimize.py');
      const pythonProcess = spawn(PYTHON_PATH, [scriptPath]);

      pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            mainWindow.webContents.send('optimize-progress', { type: 'progress', message: line });
          }
        });
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        mainWindow.webContents.send('optimize-progress', { type: 'error', message: error });
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          mainWindow.webContents.send('optimize-progress', { type: 'done' });
          resolve({ success: true });
        } else {
          mainWindow.webContents.send('optimize-progress', { type: 'error', message: 'Optimization script failed.' });
          reject({ success: false });
        }
      });
    });
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 