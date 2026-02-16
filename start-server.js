const { spawn } = require('child_process');
const path = require('path');

const vite = spawn('node', [path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')], {
    stdio: 'inherit',
    shell: false
});

vite.on('error', (error) => {
    console.error('Failed to start Vite:', error);
});

vite.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
});
