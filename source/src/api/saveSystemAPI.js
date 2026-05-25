import { invoke } from "./ipcClient";

export async function loadAutomationsFromSaveSystem() {
  return await invoke("save-system-load-automations");
}

export async function saveAutomationsToSaveSystem(automations) {
  return await invoke("save-system-save-automations", automations);
}

export async function loadProgramSettingsFromSaveSystem() {
  return await invoke("save-system-load-program-settings");
}

export async function saveProgramSettingsToSaveSystem(settings) {
  return await invoke("save-system-save-program-settings", settings);
}

export async function loadGlobalKeybindsFromSaveSystem() {
  return await invoke("save-system-load-global-keybinds");
}

export async function saveGlobalKeybindsToSaveSystem(keybinds) {
  return await invoke("save-system-save-global-keybinds", keybinds);
}

export async function resetSaveSystem() {
  return await invoke("save-system-reset");
}

export async function getSaveSystemFolder() {
  return await invoke("save-system-get-folder");
}

export async function refreshGlobalHotkeys() {
  return await invoke("global-hotkeys-refresh");
}