const STORAGE_KEY = "zlice-automations";

export function loadAutomations() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveAutomations(automations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
}

export function createAutomationId() {
  return `automation_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}