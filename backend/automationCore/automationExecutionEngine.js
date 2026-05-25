const { getModuleRunner } = require("../automationModules/moduleRunners");

const DELAY_BETWEEN_MODULES_MS = 150;
const DELAY_BETWEEN_BLOCKS_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error) {
  return String(error?.message || error);
}

function getAutomationBlocks(automation) {
  if (Array.isArray(automation?.blocks)) return automation.blocks;
  if (Array.isArray(automation?.steps)) return automation.steps;
  return [];
}

function getBlockModules(block) {
  if (Array.isArray(block?.modules)) return block.modules;
  if (Array.isArray(block?.objects)) return block.objects;
  return [];
}

function getBlockName(block, index) {
  return String(block?.name || `Block ${index + 1}`);
}

function getModuleName(module, index) {
  return String(module?.name || module?.type || `Module ${index + 1}`);
}

function loadSavedAutomations() {
  try {
    const saveSystem = require("../saveSystem");

    if (typeof saveSystem.loadAutomations === "function") {
      return saveSystem.loadAutomations();
    }

    if (typeof saveSystem.loadData === "function") {
      const data = saveSystem.loadData();
      return Array.isArray(data?.automations) ? data.automations : [];
    }
  } catch (error) {
    console.error("[FlowTools] Could not load saved automations:", error);
  }

  return [];
}

function createRuntime({ resolve, automation, automationStack }) {
  return {
    variables: {},
    objects: [],
    shouldStop: false,

    async runAutomationById(automationId) {
      const automations = loadSavedAutomations();

      const targetAutomation = automations.find(
        (item) => item.id === automationId
      );

      if (!targetAutomation) {
        return {
          success: false,
          error: `Automation with id "${automationId}" was not found.`,
        };
      }

      if (automationStack.includes(targetAutomation.id)) {
        return {
          success: false,
          error: `Automation loop blocked: "${targetAutomation.name}" is already running.`,
        };
      }

      return await executeAutomation({
        resolve,
        automation: targetAutomation,
        blockId: null,
        automationStack: [...automationStack, targetAutomation.id],
      });
    },
  };
}

async function getResolveContext(resolve) {
  const projectManager = await resolve.GetProjectManager();
  const project = await projectManager.GetCurrentProject();

  if (!project) {
    throw new Error("No Resolve project is open.");
  }

  const timeline = await project.GetCurrentTimeline();

  if (!timeline) {
    throw new Error("No current timeline found.");
  }

  return {
    resolve,
    project,
    timeline,
  };
}

async function runModule({
  resolve,
  automation,
  block,
  blockIndex,
  module,
  moduleIndex,
  runtime,
}) {
  if (!module?.type) {
    throw new Error(`Module ${moduleIndex + 1} is missing type.`);
  }

  const runner = getModuleRunner(module.type);

  if (!runner) {
    throw new Error(`No backend runner found for module type: ${module.type}`);
  }

  const context = await getResolveContext(resolve);

  console.log(
    `[FlowTools] Module ${moduleIndex + 1}: ${getModuleName(
      module,
      moduleIndex
    )}`
  );

  return await runner({
    ...context,
    automation,
    block,
    blockIndex,
    module,
    moduleIndex,
    runtime,
  });
}

async function runBlock({
  resolve,
  automation,
  block,
  blockIndex,
  automationStack,
}) {
  const blockName = getBlockName(block, blockIndex);
  const modules = getBlockModules(block);

  console.log(`[FlowTools] Starting block ${blockIndex + 1}: ${blockName}`);

  if (modules.length === 0) {
    return {
      success: true,
      skipped: true,
      blockId: block?.id || null,
      blockName,
      message: `Skipped empty block "${blockName}".`,
      modules: [],
    };
  }

  const runtime = createRuntime({
    resolve,
    automation,
    automationStack,
  });

  const moduleResults = [];
  let blockHadFailure = false;

  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
    if (runtime.shouldStop) {
      console.log(`[FlowTools] Block stopped by runtime: ${blockName}`);
      break;
    }

    const module = modules[moduleIndex];

    try {
      const result = await runModule({
        resolve,
        automation,
        block,
        blockIndex,
        module,
        moduleIndex,
        runtime,
      });

      if (result?.success === false) {
        blockHadFailure = true;
      }

      moduleResults.push({
        success: result?.success !== false,
        moduleId: module?.id || null,
        moduleType: module?.type || null,
        moduleName: getModuleName(module, moduleIndex),
        error: result?.success === false ? result.error || result.message : null,
        result,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      blockHadFailure = true;

      console.error(
        `[FlowTools] Failed module ${moduleIndex + 1} in block "${blockName}", continuing:`,
        error
      );

      moduleResults.push({
        success: false,
        moduleId: module?.id || null,
        moduleType: module?.type || null,
        moduleName: getModuleName(module, moduleIndex),
        error: message,
      });
    }

    await sleep(DELAY_BETWEEN_MODULES_MS);
  }

  console.log(`[FlowTools] Finished block ${blockIndex + 1}: ${blockName}`);

  return {
    success: !blockHadFailure,
    skipped: false,
    blockId: block?.id || null,
    blockName,
    message: blockHadFailure
      ? `Finished block "${blockName}" with failed module(s).`
      : `Finished block "${blockName}".`,
    modules: moduleResults,
  };
}

async function executeAutomation({
  resolve,
  automation,
  blockId = null,
  automationStack = [automation?.id].filter(Boolean),
}) {
  const automationName = String(automation?.name || "Unnamed Automation");
  const blocks = getAutomationBlocks(automation);

  if (blocks.length === 0) {
    return {
      success: false,
      error: `Automation "${automationName}" has no blocks.`,
      blocks: [],
    };
  }

  const blockResults = [];
  let automationHadFailure = false;

  console.log(
    `[FlowTools] Starting ${
      blockId ? "single block" : "automation"
    } run: ${automationName}`
  );

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];

    if (blockId && block.id !== blockId) continue;

    const blockResult = await runBlock({
      resolve,
      automation,
      block,
      blockIndex,
      automationStack,
    });

    if (!blockResult.success) {
      automationHadFailure = true;
    }

    blockResults.push(blockResult);

    await sleep(DELAY_BETWEEN_BLOCKS_MS);
  }

  if (blockId && blockResults.length === 0) {
    return {
      success: false,
      automationName,
      error: `Block with id "${blockId}" was not found.`,
      blocks: [],
    };
  }

  return {
    success: !automationHadFailure,
    completedWithErrors: automationHadFailure,
    automationName,
    message: automationHadFailure
      ? `Automation "${automationName}" finished with errors. Ran ${blockResults.length} block(s).`
      : blockId
        ? "Block completed."
        : `Automation "${automationName}" completed. Ran ${blockResults.length} block(s).`,
    blocks: blockResults,
  };
}

module.exports = {
  executeAutomation,
};