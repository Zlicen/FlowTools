const { loadAutomations, loadGlobalKeybinds } = require("./saveSystem");

let globalShortcutRef = null;
let runAutomationByIdRef = null;
let registeredAccelerators = new Set();

function keyToAcceleratorPart(key) {
  if (key === "Ctrl") return "CommandOrControl";
  if (key === "Alt") return "Alt";
  if (key === "Shift") return "Shift";
  if (key === "Meta") return "Super";

  if (key === " ") return "Space";
  if (key === "ArrowUp") return "Up";
  if (key === "ArrowDown") return "Down";
  if (key === "ArrowLeft") return "Left";
  if (key === "ArrowRight") return "Right";
  if (key === "Escape") return "Esc";
  if (key === "+") return "Plus";

  return key;
}

function keysToAccelerator(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return "";

  return keys.map(keyToAcceleratorPart).join("+");
}

function unregisterGlobalHotkeys() {
  if (!globalShortcutRef) return;

  for (const accelerator of registeredAccelerators) {
    globalShortcutRef.unregister(accelerator);
  }

  registeredAccelerators = new Set();
}

function registerGlobalHotkeys() {
  if (!globalShortcutRef || typeof runAutomationByIdRef !== "function") {
    return {
      success: false,
      error: "Global hotkey manager is not initialized.",
    };
  }

  unregisterGlobalHotkeys();

  const keybinds = loadGlobalKeybinds();
  const bindings = keybinds.bindings || {};
  const results = [];

  for (const [targetKey, binding] of Object.entries(bindings)) {
    if (!binding?.enabled) continue;
    if (binding.targetType !== "automation") continue;
    if (!binding.targetId) continue;

    const accelerator = keysToAccelerator(binding.keys);

    if (!accelerator) continue;

    const registered = globalShortcutRef.register(accelerator, async () => {
      try {
        await runAutomationByIdRef(binding.targetId);
      } catch (error) {
        console.error(
          `[FlowTools] Failed to run global hotkey automation: ${binding.label || targetKey}`,
          error
        );
      }
    });

    results.push({
      targetKey,
      accelerator,
      label: binding.label || targetKey,
      registered,
    });

    if (registered) {
      registeredAccelerators.add(accelerator);
    } else {
      console.warn(
        `[FlowTools] Could not register global shortcut "${accelerator}" for "${binding.label || targetKey}".`
      );
    }
  }

  return {
    success: true,
    registeredCount: registeredAccelerators.size,
    results,
  };
}

function initializeGlobalHotkeys({ globalShortcut, runAutomationById }) {
  globalShortcutRef = globalShortcut;
  runAutomationByIdRef = runAutomationById;

  return registerGlobalHotkeys();
}

function refreshGlobalHotkeys() {
  return registerGlobalHotkeys();
}

function disposeGlobalHotkeys() {
  unregisterGlobalHotkeys();

  if (globalShortcutRef) {
    globalShortcutRef.unregisterAll();
  }
}

module.exports = {
  initializeGlobalHotkeys,
  refreshGlobalHotkeys,
  disposeGlobalHotkeys,
};