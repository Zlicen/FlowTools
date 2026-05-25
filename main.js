const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");

const { registerSaveSystemIpc } = require("./backend/saveSystem");

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

function registerFileDialogIpc() {
  ipcMain.handle("dialog-choose-lut-file", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose LUT File",

      // NEW DEFAULT FOLDER
      defaultPath:
        "C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\LUT",

      properties: ["openFile"],

      filters: [
        {
          name: "LUT Files",
          extensions: ["cube", "3dl", "lut"],
        },

        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (
      result.canceled ||
      !result.filePaths ||
      result.filePaths.length === 0
    ) {
      return null;
    }

    return result.filePaths[0];
  });
}

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

  mainWindow.loadFile(
    path.join(__dirname, "app", "index.html")
  );
}

app.whenReady().then(async () => {
  registerAutomationRunnerIpc(ipcMain);

  registerProjectMediaBrowserIpc(
    ipcMain,
    getResolve
  );

  registerResolveDebugIpc(
    ipcMain,
    getResolve
  );

  registerMediaLibraryIpc(
    ipcMain,
    getResolve,
    dialog
  );

  registerFileDialogIpc(); // LUT browser

  registerSaveSystemIpc(ipcMain);

  await initResolve();

  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});