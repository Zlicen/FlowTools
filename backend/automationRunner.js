const WorkflowIntegration = require("../WorkflowIntegration.node");

const { getModuleRunner } = require("./automationModules/moduleRunners");

const {
  getAllModuleCapabilities,
} = require("./automationModules/moduleCapabilities");

const PLUGIN_ID = "com.flowtools";

let resolve = null;

async function initResolve() {
  const initialized =
    await WorkflowIntegration.Initialize(PLUGIN_ID);

  if (!initialized) {
    console.log("Failed to initialize Resolve.");
    return null;
  }

  resolve = await WorkflowIntegration.GetResolve();

  if (!resolve) {
    console.log("Failed to get Resolve object.");
    return null;
  }

  console.log("Zlice Resolve Panel connected to Resolve.");
  return resolve;
}

async function getCurrentTimeline() {
  if (!resolve) {
    await initResolve();
  }

  if (!resolve) {
    throw new Error("Resolve is not connected.");
  }

  const projectManager =
    await resolve.GetProjectManager();

  const project =
    await projectManager.GetCurrentProject();

  if (!project) {
    throw new Error("No Resolve project is open.");
  }

  const timeline =
    await project.GetCurrentTimeline();

  if (!timeline) {
    throw new Error("No current timeline found.");
  }

  return {
    project,
    timeline,
  };
}

function createBlockRuntime() {
  return {
    variables: {},
    objects: [],
    shouldStop: false,
  };
}

async function runModule({
  resolve,
  project,
  timeline,
  automation,
  module,
  runtime,
}) {
  const runner =
    getModuleRunner(module.type);

  if (!runner) {
    throw new Error(
      `No runner found for module type: ${module.type}`
    );
  }

  return await runner({
    resolve,
    project,
    timeline,
    automation,
    module,
    runtime,
  });
}

async function runAutomationBlock({
  resolve,
  project,
  timeline,
  automation,
  block,
}) {
  const runtime = createBlockRuntime();

  const context = {
    resolve,
    project,
    timeline,
    automation,
    runtime,
  };

  const modules =
    block.modules ||
    block.objects ||
    [];

  if (modules.length === 0) {
    throw new Error(
      `Block "${block.name}" is missing modules.`
    );
  }

  for (const module of modules) {
    if (runtime.shouldStop) break;

    await runModule({
      ...context,
      module,
    });
  }

  runtime.objects = [];
}

async function runAutomation(automation) {
  const { project, timeline } =
    await getCurrentTimeline();

  const blocks = automation.blocks || [];

  for (const block of blocks) {
    await runAutomationBlock({
      resolve,
      project,
      timeline,
      automation,
      block,
    });
  }

  return {
    success: true,
  };
}

function registerAutomationRunnerIpc(ipcMain) {
  ipcMain.handle(
    "automation-module-capabilities",
    async () => {
      return {
        success: true,
        capabilities:
          getAllModuleCapabilities(),
      };
    }
  );

  ipcMain.handle(
    "automation-run",
    async (event, automation) => {
      try {
        return await runAutomation(automation);
      } catch (error) {
        console.error(
          "Automation run failed:",
          error
        );

        return {
          success: false,
          error: String(error),
        };
      }
    }
  );
}

function getResolve() {
  return resolve;
}

module.exports = {
  initResolve,
  getResolve,
  registerAutomationRunnerIpc,
};