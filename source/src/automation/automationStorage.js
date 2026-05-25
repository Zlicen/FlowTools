import {
  loadAutomationsFromSaveSystem,
  saveAutomationsToSaveSystem,
} from "../api/saveSystemAPI";

export async function loadAutomations() {
  const result = await loadAutomationsFromSaveSystem();

  if (!result?.success) {
    return [];
  }

  return Array.isArray(result.automations)
    ? result.automations
    : [];
}

export async function saveAutomations(automations) {
  const result = await saveAutomationsToSaveSystem(automations);

  return result?.success === true;
}

export function createAutomationId() {
  return `automation_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}