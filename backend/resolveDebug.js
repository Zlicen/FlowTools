function getFunctionNames(object) {
  if (!object) return [];

  const names = new Set();

  let current = object;

  while (current) {
    for (const name of Object.getOwnPropertyNames(current)) {
      try {
        if (typeof object[name] === "function") {
          names.add(name);
        }
      } catch {}
    }

    current = Object.getPrototypeOf(current);
  }

  return [...names].sort();
}

async function safeCall(label, fn) {
  try {
    const result = await fn();

    return {
      label,
      success: true,
      type: typeof result,
      isArray: Array.isArray(result),
      keys: result && typeof result === "object" ? Object.keys(result) : [],
      functions:
        result && typeof result === "object" ? getFunctionNames(result) : [],
    };
  } catch (error) {
    return {
      label,
      success: false,
      error: String(error),
    };
  }
}

function registerResolveDebugIpc(ipcMain, getResolve) {
  ipcMain.handle("resolve-debug-media-pool", async () => {
    const resolve = getResolve();

    if (!resolve) {
      throw new Error("Resolve is not connected.");
    }

    const projectManager = await resolve.GetProjectManager();
    const project = await projectManager.GetCurrentProject();
    const mediaPool = await project.GetMediaPool();

    const checks = [];

    checks.push({
      label: "resolve",
      functions: getFunctionNames(resolve),
    });

    checks.push({
      label: "project",
      functions: getFunctionNames(project),
    });

    checks.push({
      label: "mediaPool",
      functions: getFunctionNames(mediaPool),
    });

    checks.push(await safeCall("mediaPool.GetRootFolder()", () => mediaPool.GetRootFolder()));
    checks.push(await safeCall("mediaPool.GetCurrentFolder()", () => mediaPool.GetCurrentFolder()));
    checks.push(await safeCall("mediaPool.GetPowerBinFolder()", () => mediaPool.GetPowerBinFolder()));
    checks.push(await safeCall("mediaPool.GetPowerBinList()", () => mediaPool.GetPowerBinList()));
    checks.push(await safeCall("mediaPool.GetSmartBinList()", () => mediaPool.GetSmartBinList()));

    return {
      success: true,
      checks,
    };
  });
}

module.exports = {
  registerResolveDebugIpc,
};