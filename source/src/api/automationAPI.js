import { invoke } from "./ipcClient";

export async function runAutomation(automation) {
  return await invoke("automation-run", automation);
}

export async function getAutomationModuleCapabilities() {
  return await invoke("automation-module-capabilities");
}