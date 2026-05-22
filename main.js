const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");

const { registerResolveDebugIpc } = require("./backend/resolveDebug");

const { registerMediaLibraryIpc } = require("./backend/mediaLibrary");

const {
  initResolve,
  getResolve,
  registerAutomationRunnerIpc,
} = require("./backend/automationRunner");

const {
  registerProjectMediaBrowserIpc,
} = require("./backend/projectMediaBrowser");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#111111",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "app", "index.html"));
}

app.whenReady().then(async () => {
  registerAutomationRunnerIpc(ipcMain);
  registerProjectMediaBrowserIpc(ipcMain, getResolve);
  registerResolveDebugIpc(ipcMain, getResolve);
  registerMediaLibraryIpc(ipcMain, getResolve, dialog);

  await initResolve();

  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});