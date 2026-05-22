import { moduleRegistry } from "./moduleRegistry";

let backendCompatibility = {
  objectActionRules: {},
};

export function setBackendModuleCapabilities(nextCapabilities) {
  backendCompatibility = {
    objectActionRules:
      nextCapabilities?.objectActionRules || {},
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
  if (!warnings[moduleId]) {
    warnings[moduleId] = [];
  }

  if (!warnings[moduleId].includes(message)) {
    warnings[moduleId].push(message);
  }
}

function getWarningsForBlock(block, warnings) {
  const objects = block.objects || [];
  const actions = block.actions || [];

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