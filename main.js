const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

ipcMain.handle('document:save-pdf', async (event, options) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    throw new Error('Окно приложения для экспорта PDF не найдено.');
  }

  const suggestedName = typeof options?.suggestedName === 'string'
    ? path.basename(options.suggestedName).replace(/[<>:"/\\|?*]/g, '_')
    : 'fasadlab-document.pdf';
  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    title: 'Сохранить документ PDF',
    defaultPath: suggestedName.toLowerCase().endsWith('.pdf') ? suggestedName : `${suggestedName}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) {
    return { canceled: true };
  }

  const outputPath = path.extname(filePath).toLowerCase() === '.pdf' ? filePath : `${filePath}.pdf`;
  const pdf = await event.sender.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  await fs.writeFile(outputPath, pdf);
  return { canceled: false, filePath: outputPath };
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
