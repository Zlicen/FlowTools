const fs = require("fs");
const path = require("path");

const SAVE_SYSTEM_VERSION = 1;

const ROOT_SAVE_FOLDER = path.join(__dirname, "..", "user-data");
const AUTOMATIONS_FOLDER = path.join(ROOT_SAVE_FOLDER, "automations");
const SETTINGS_FOLDER = path.join(ROOT_SAVE_FOLDER, "settings");

const AUTOMATION_INDEX_FILE = path.join(AUTOMATIONS_FOLDER, "index.json");
const PROGRAM_SETTINGS_FILE = path.join(SETTINGS_FOLDER, "program-settings.json");
const GLOBAL_KEYBINDS_FILE = path.join(SETTINGS_FOLDER, "global-keybinds.json");

function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
}

function readJson(filePath, fallbackValue) {
  try {
    if (!fs.existsSync(filePath)) return fallbackValue;

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read JSON: ${filePath}`, error);
    return fallbackValue;
  }
}

function writeJson(filePath, value) {
  ensureFolder(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function safeFolderName(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
}

function createDefaultProgramSettings() {
  return {
    saveSystemVersion: SAVE_SYSTEM_VERSION,

    appearance: {
      panelScale: 1,
      compactMode: false,
    },

    automationEditor: {
      leftPanelWidth: 300,
      rightPanelWidth: 300,
    },
  };
}

function createDefaultGlobalKeybinds() {
  return {
    saveSystemVersion: SAVE_SYSTEM_VERSION,
    version: 1,
    bindings: {},
  };
}

function normalizeGlobalKeybinds(data) {
  const fallback = createDefaultGlobalKeybinds();

  return {
    ...fallback,
    ...(data || {}),
    saveSystemVersion: SAVE_SYSTEM_VERSION,
    version: 1,
    bindings:
      data && typeof data.bindings === "object" && !Array.isArray(data.bindings)
        ? data.bindings
        : {},
  };
}

function normalizeAutomation(automation) {
  const now = new Date().toISOString();

  return {
    saveSystemVersion: SAVE_SYSTEM_VERSION,

    id: automation.id,
    name: automation.name || "Untitled Automation",

    blocks: Array.isArray(automation.blocks) ? automation.blocks : [],
    steps: Array.isArray(automation.steps) ? automation.steps : [],

    createdAt: automation.createdAt || now,
    updatedAt: automation.updatedAt || now,
  };
}

function getAutomationFolder(automationId) {
  return path.join(AUTOMATIONS_FOLDER, safeFolderName(automationId));
}

function getAutomationFile(automationId) {
  return path.join(getAutomationFolder(automationId), "automation.json");
}

function ensureSaveSystem() {
  ensureFolder(ROOT_SAVE_FOLDER);
  ensureFolder(AUTOMATIONS_FOLDER);
  ensureFolder(SETTINGS_FOLDER);

  if (!fs.existsSync(AUTOMATION_INDEX_FILE)) {
    writeJson(AUTOMATION_INDEX_FILE, {
      saveSystemVersion: SAVE_SYSTEM_VERSION,
      automationIds: [],
    });
  }

  if (!fs.existsSync(PROGRAM_SETTINGS_FILE)) {
    writeJson(PROGRAM_SETTINGS_FILE, createDefaultProgramSettings());
  }

  if (!fs.existsSync(GLOBAL_KEYBINDS_FILE)) {
    writeJson(GLOBAL_KEYBINDS_FILE, createDefaultGlobalKeybinds());
  }
}

function loadAutomationIndex() {
  ensureSaveSystem();

  const index = readJson(AUTOMATION_INDEX_FILE, {
    saveSystemVersion: SAVE_SYSTEM_VERSION,
    automationIds: [],
  });

  return {
    saveSystemVersion: index.saveSystemVersion || SAVE_SYSTEM_VERSION,
    automationIds: Array.isArray(index.automationIds)
      ? index.automationIds
      : [],
  };
}

function saveAutomationIndex(automationIds) {
  writeJson(AUTOMATION_INDEX_FILE, {
    saveSystemVersion: SAVE_SYSTEM_VERSION,
    automationIds,
  });
}

function loadAutomations() {
  ensureSaveSystem();

  const index = loadAutomationIndex();
  const loadedAutomations = [];

  for (const automationId of index.automationIds) {
    const automationFile = getAutomationFile(automationId);
    const automation = readJson(automationFile, null);

    if (automation && automation.id) {
      loadedAutomations.push(normalizeAutomation(automation));
    }
  }

  return loadedAutomations;
}

function saveAutomations(automations) {
  ensureSaveSystem();

  const automationIds = [];

  for (const automation of automations || []) {
    if (!automation || !automation.id) continue;

    const normalizedAutomation = normalizeAutomation(automation);
    automationIds.push(normalizedAutomation.id);

    writeJson(getAutomationFile(normalizedAutomation.id), normalizedAutomation);
  }

  saveAutomationIndex(automationIds);
  cleanupDeletedAutomationFolders(automationIds);

  return {
    success: true,
    automations: loadAutomations(),
  };
}

function cleanupDeletedAutomationFolders(activeAutomationIds) {
  ensureFolder(AUTOMATIONS_FOLDER);

  const activeIds = new Set(activeAutomationIds);
  const entries = fs.readdirSync(AUTOMATIONS_FOLDER, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const folderPath = path.join(AUTOMATIONS_FOLDER, entry.name);
    const automationFile = path.join(folderPath, "automation.json");
    const automation = readJson(automationFile, null);

    if (!automation || !automation.id) continue;

    if (!activeIds.has(automation.id)) {
      fs.rmSync(folderPath, {
        recursive: true,
        force: true,
      });
    }
  }
}

function loadProgramSettings() {
  ensureSaveSystem();

  const savedSettings = readJson(
    PROGRAM_SETTINGS_FILE,
    createDefaultProgramSettings()
  );

  return {
    ...createDefaultProgramSettings(),
    ...savedSettings,

    appearance: {
      ...createDefaultProgramSettings().appearance,
      ...(savedSettings.appearance || {}),
    },

    automationEditor: {
      ...createDefaultProgramSettings().automationEditor,
      ...(savedSettings.automationEditor || {}),
    },
  };
}

function saveProgramSettings(settings) {
  ensureSaveSystem();

  const nextSettings = {
    ...loadProgramSettings(),
    ...(settings || {}),
    saveSystemVersion: SAVE_SYSTEM_VERSION,
  };

  writeJson(PROGRAM_SETTINGS_FILE, nextSettings);

  return {
    success: true,
    settings: nextSettings,
  };
}

function loadGlobalKeybinds() {
  ensureSaveSystem();

  return normalizeGlobalKeybinds(
    readJson(GLOBAL_KEYBINDS_FILE, createDefaultGlobalKeybinds())
  );
}

function saveGlobalKeybinds(keybinds) {
  ensureSaveSystem();

  const normalized = normalizeGlobalKeybinds(keybinds);

  writeJson(GLOBAL_KEYBINDS_FILE, normalized);

  return {
    success: true,
    keybinds: normalized,
  };
}

function resetSaveSystem() {
  fs.rmSync(ROOT_SAVE_FOLDER, {
    recursive: true,
    force: true,
  });

  ensureSaveSystem();

  return {
    success: true,
  };
}

function registerSaveSystemIpc(ipcMain) {
  ipcMain.handle("save-system-load-automations", async () => {
    return {
      success: true,
      automations: loadAutomations(),
    };
  });

  ipcMain.handle("save-system-save-automations", async (event, automations) => {
    return saveAutomations(automations);
  });

  ipcMain.handle("save-system-load-program-settings", async () => {
    return {
      success: true,
      settings: loadProgramSettings(),
    };
  });

  ipcMain.handle("save-system-save-program-settings", async (event, settings) => {
    return saveProgramSettings(settings);
  });

  ipcMain.handle("save-system-load-global-keybinds", async () => {
    return {
      success: true,
      keybinds: loadGlobalKeybinds(),
    };
  });

  ipcMain.handle("save-system-save-global-keybinds", async (event, keybinds) => {
    return saveGlobalKeybinds(keybinds);
  });

  ipcMain.handle("save-system-reset", async () => {
    return resetSaveSystem();
  });

  ipcMain.handle("save-system-get-folder", async () => {
    ensureSaveSystem();

    return {
      success: true,
      folder: ROOT_SAVE_FOLDER,
    };
  });
}

module.exports = {
  registerSaveSystemIpc,
  loadAutomations,
  saveAutomations,
  loadProgramSettings,
  saveProgramSettings,
  loadGlobalKeybinds,
  saveGlobalKeybinds,
};