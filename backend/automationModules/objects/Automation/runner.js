async function runAutomationTargetModule({ module, runtime }) {
  const settings = module.settings || {};
  const action = settings.action || "run";

  if (action !== "run") {
    return {
      success: true,
      skipped: true,
      message: `Unsupported automation action: ${action}`,
    };
  }

  if (!settings.automationId) {
    return {
      success: false,
      error: "No automation selected.",
    };
  }

  if (typeof runtime.runAutomationById !== "function") {
    return {
      success: false,
      error: "Automation runner is not available in runtime.",
    };
  }

  return await runtime.runAutomationById(settings.automationId);
}

module.exports = {
  runAutomationTargetModule,
};