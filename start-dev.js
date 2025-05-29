const { spawn } = require('child_process');
const { join } = require('path');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for Vite to start
setTimeout(() => {
  // Start Electron
  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true
  });

  electron.on('close', () => {
    vite.kill();
    process.exit();
  });
}, 3000); 