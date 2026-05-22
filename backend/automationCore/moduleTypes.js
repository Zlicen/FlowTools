function isTargetModule(module) {
  return String(module?.type || "").startsWith("target-");
}

function isConditionModule(module) {
  return String(module?.type || "").startsWith("condition-");
}

function isActionModule(module) {
  return String(module?.type || "").startsWith("action-");
}

function getModuleLane(module) {
  if (isTargetModule(module)) return "targets";
  if (isConditionModule(module)) return "conditions";
  if (isActionModule(module)) return "actions";

  return null;
}

module.exports = {
  isTargetModule,
  isConditionModule,
  isActionModule,
  getModuleLane,
};