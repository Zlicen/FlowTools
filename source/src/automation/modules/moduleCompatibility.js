import { moduleRegistry } from "./moduleRegistry";

let backendCompatibility = {
  objectActionRules: {},
};

export function setBackendModuleCapabilities(nextCapabilities) {
  backendCompatibility = {
    objectActionRules: nextCapabilities?.objectActionRules || {},
  };
}

export function getModuleDefinition(module) {
  return moduleRegistry[module?.type] || null;
}

export function getModuleDisplayName(module) {
  const definition = getModuleDefinition(module);

  return definition?.name || module?.name || module?.type || "Unknown";
}

function addWarning(warnings, moduleId, message) {
  if (!moduleId || !message) return;

  if (!warnings[moduleId]) {
    warnings[moduleId] = [];
  }

  if (!warnings[moduleId].includes(message)) {
    warnings[moduleId].push(message);
  }
}

function normalizeValidationResult(result) {
  if (!result) return [];

  if (Array.isArray(result)) {
    return result.filter(Boolean);
  }

  if (typeof result === "string") {
    return [result];
  }

  return [];
}

function getWarningsForModule(module, warnings) {
  const definition = getModuleDefinition(module);

  if (!definition || typeof definition.validateSettings !== "function") {
    return;
  }

  const result = definition.validateSettings(module.settings || {}, module);
  const messages = normalizeValidationResult(result);

  for (const message of messages) {
    addWarning(warnings, module.id, message);
  }
}

function getWarningsForOldObjectActionSystem(block, warnings) {
  const objects = block.objects || [];
  const actions = block.actions || [];

  if (objects.length === 0 && actions.length === 0) {
    return;
  }

  const rules = backendCompatibility.objectActionRules || {};

  for (const object of objects) {
    const allowedActions = rules[object.type] || [];
    const objectName = getModuleDisplayName(object);

    for (const action of actions) {
      const actionName = getModuleDisplayName(action);

      if (!allowedActions.includes(action.type)) {
        addWarning(
          warnings,
          object.id,
          `${objectName} cannot use action "${actionName}".`
        );

        addWarning(
          warnings,
          action.id,
          `${actionName} cannot be used with object "${objectName}".`
        );
      }
    }
  }
}

function getWarningsForBlock(block, warnings) {
  const modules = block.modules || [];

  for (const module of modules) {
    getWarningsForModule(module, warnings);
  }

  getWarningsForOldObjectActionSystem(block, warnings);
}

export function getModuleWarningsById(blockOrBlocks) {
  const warnings = {};

  if (Array.isArray(blockOrBlocks)) {
    for (const block of blockOrBlocks) {
      getWarningsForBlock(block, warnings);
    }

    return warnings;
  }

  if (blockOrBlocks) {
    getWarningsForBlock(blockOrBlocks, warnings);
  }

  return warnings;
}