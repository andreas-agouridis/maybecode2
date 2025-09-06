import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(process.cwd(), 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(process.cwd(), 'preload.js')
    }
  });

  await win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (canceled) return;
  const content = fs.readFileSync(filePaths[0], 'utf8');
  return { content, filePath: filePaths[0] };
});

ipcMain.handle('dialog:saveFile', async (event, { filePath, content }) => {
  if (!filePath) {
    const { filePath: savePath } = await dialog.showSaveDialog();
    if (!savePath) return;
    fs.writeFileSync(savePath, content);
    return savePath;
  } else {
    fs.writeFileSync(filePath, content);
    return filePath;
  }
});

ipcMain.handle('run-python', async (event, code) => {
  const appDataPath = app.getPath('appData');
  const appFolder = path.join(appDataPath, 'MaybeCode');
  
  if (!fs.existsSync(appFolder)) {
    fs.mkdirSync(appFolder);
  }
  
  const tmpFile = path.join(appFolder, 'temp.py');
  fs.writeFileSync(tmpFile, code);
  
  return new Promise((resolve) => {
    exec(`python "${tmpFile}"`, (error, stdout, stderr) => {
      fs.unlinkSync(tmpFile);
      if (error) {
        resolve(stderr || 'Python execution failed');
      } else {
        resolve(stdout);
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

