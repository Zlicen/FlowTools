const WorkflowIntegration = require("../WorkflowIntegration.node");

const {
  getAllModuleCapabilities,
} = require("./automationModules/moduleCapabilities");

const {
  executeAutomation,
} = require("./automationCore/automationExecutionEngine");

const PLUGIN_ID = "com.flowtools";

let resolve = null;
let isAutomationRunning = false;

async function initResolve() {
  const initialized = await WorkflowIntegration.Initialize(PLUGIN_ID);

  if (!initialized) {
    console.log("Failed to initialize Resolve.");
    return null;
  }

  resolve = await WorkflowIntegration.GetResolve();

  if (!resolve) {
    console.log("Failed to get Resolve object.");
    return null;
  }

  console.log("FlowTools connected to Resolve.");
  return resolve;
}

async function ensureResolve() {
  if (!resolve) {
    await initResolve();
  }

  if (!resolve) {
    throw new Error("Resolve is not connected.");
  }

  return resolve;
}

function getResolve() {
  return resolve;
}

async function runAutomationRequest({ automation, blockId = null }) {
  if (isAutomationRunning) {
    return {
      success: false,
      error: "Another automation is already running.",
    };
  }

  isAutomationRunning = true;

  try {
    const activeResolve = await ensureResolve();

    return await executeAutomation({
      resolve: activeResolve,
      automation,
      blockId,
    });
  } catch (error) {
    console.error("FlowTools automation failed:", error);

    return {
      success: false,
      error: String(error?.message || error),
    };
  } finally {
    isAutomationRunning = false;
  }
}

function registerAutomationRunnerIpc(ipcMain) {
  ipcMain.handle("automation-module-capabilities", async () => {
    return {
      success: true,
      capabilities: getAllModuleCapabilities(),
    };
  });

  ipcMain.handle("automation-run", async (event, automation) => {
    return await runAutomationRequest({
      automation,
      blockId: null,
    });
  });

  ipcMain.handle("automation-run-block", async (event, payload) => {
    return await runAutomationRequest({
      automation: payload.automation,
      blockId: payload.blockId,
    });
  });
}

module.exports = {
  initResolve,
  getResolve,
  registerAutomationRunnerIpc,
  runAutomationRequest,
};