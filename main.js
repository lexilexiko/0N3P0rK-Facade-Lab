const { app, BrowserWindow, ipcMain } = require('electron');
const crypto = require('node:crypto');
const path = require('node:path');

const unlockDigest = Buffer.from('ffd78a5e41e888974a00c369b1dd7b05c0b47cf97bc609c60a8a1c1cae8e537b', 'hex');
ipcMain.handle('auth:unlock', (_event, password) => {
  if (typeof password !== 'string' || password.length > 128) return false;
  const supplied = crypto.createHash('sha256').update(password, 'utf8').digest();
  return crypto.timingSafeEqual(unlockDigest, supplied);
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#d6d1c7',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  window.loadFile(path.join(__dirname, 'fasadlab_prototype.html'));
}

app.whenReady().then(() => {
  app.setAppUserModelId('ru.fasadlab.desktop');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
