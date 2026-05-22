export function createModuleInstance(moduleDefinition) {
  return {
    id: crypto.randomUUID(),
    type: moduleDefinition.id,
    name: moduleDefinition.name,
    settings:
      typeof moduleDefinition.createDefaultSettings === "function"
        ? moduleDefinition.createDefaultSettings()
        : {},
  };
}

export function getModuleLane() {
  return "modules";
}

export function getModuleInstanceLane() {
  return "modules";
}

export function updateModuleInBlock(block, updatedModule) {
  return {
    ...block,
    modules: (block.modules || []).map((module) =>
      module.id === updatedModule.id ? updatedModule : module
    ),
  };
}