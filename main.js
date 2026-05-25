const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require("electron");

const path = require("path");

const {
  registerSaveSystemIpc,
  loadAutomations,
} = require("./backend/saveSystem");

const { registerResolveDebugIpc } = require("./backend/resolveDebug");
const { registerMediaLibraryIpc } = require("./backend/mediaLibrary");

const {
  initResolve,
  getResolve,
  registerAutomationRunnerIpc,
  runAutomationRequest,
} = require("./backend/automationRunner");

const {
  initializeGlobalHotkeys,
  refreshGlobalHotkeys,
  disposeGlobalHotkeys,
} = require("./backend/globalHotkeyManager");

const {
  registerProjectMediaBrowserIpc,
} = require("./backend/projectMediaBrowser");

let mainWindow = null;

function registerFileDialogIpc() {
  ipcMain.handle("dialog-choose-lut-file", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose LUT File",
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

function registerGlobalHotkeyIpc() {
  ipcMain.handle("global-hotkeys-refresh", async () => {
    return refreshGlobalHotkeys();
  });
}

async function runAutomationById(automationId) {
  const automations = loadAutomations();
  const automation = automations.find((item) => item.id === automationId);

  if (!automation) {
    console.warn(`[FlowTools] Global hotkey automation not found: ${automationId}`);

    return {
      success: false,
      error: `Automation not found: ${automationId}`,
    };
  }

  console.log(`[FlowTools] Global hotkey running automation: ${automation.name}`);

  return await runAutomationRequest({
    automation,
    blockId: null,
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

  mainWindow.loadFile(path.join(__dirname, "app", "index.html"));
}

app.whenReady().then(async () => {
  registerAutomationRunnerIpc(ipcMain);

  registerProjectMediaBrowserIpc(ipcMain, getResolve);

  registerResolveDebugIpc(ipcMain, getResolve);

  registerMediaLibraryIpc(ipcMain, getResolve, dialog);

  registerFileDialogIpc();

  registerSaveSystemIpc(ipcMain);

  registerGlobalHotkeyIpc();

  await initResolve();

  createWindow();

  initializeGlobalHotkeys({
    globalShortcut,
    runAutomationById,
  });
});

app.on("will-quit", () => {
  disposeGlobalHotkeys();
});

app.on("window-all-closed", () => {
  app.quit();
});