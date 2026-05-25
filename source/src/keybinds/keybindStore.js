import {
  loadGlobalKeybindsFromSaveSystem,
  refreshGlobalHotkeys,
  saveGlobalKeybindsToSaveSystem,
} from "../api/saveSystemAPI";

import { findKeybindConflict } from "./keybindUtils";

const subscribers = new Set();

const DEFAULT_KEYBINDS = {
  saveSystemVersion: 1,
  version: 1,
  bindings: {},
};

let state = {
  keybinds: DEFAULT_KEYBINDS,
  isLoaded: false,
};

function emit() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function setState(update) {
  state =
    typeof update === "function"
      ? update(state)
      : {
          ...state,
          ...update,
        };

  emit();
}

function normalizeKeybinds(keybinds) {
  return {
    ...DEFAULT_KEYBINDS,
    ...(keybinds || {}),
    bindings:
      keybinds &&
      typeof keybinds.bindings === "object" &&
      !Array.isArray(keybinds.bindings)
        ? keybinds.bindings
        : {},
  };
}

async function saveKeybinds(nextKeybinds) {
  const normalized = normalizeKeybinds(nextKeybinds);
  const result = await saveGlobalKeybindsToSaveSystem(normalized);

  if (!result?.success) {
    return {
      success: false,
      error: result?.error || "Failed to save keybinds.",
    };
  }

  setState({
    keybinds: normalizeKeybinds(result.keybinds),
    isLoaded: true,
  });

  await refreshGlobalHotkeys();

  return {
    success: true,
    keybinds: normalizeKeybinds(result.keybinds),
  };
}

export const keybindStore = {
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  getSnapshot() {
    return state;
  },

  async load() {
    if (state.isLoaded) return;

    const result = await loadGlobalKeybindsFromSaveSystem();

    setState({
      keybinds: normalizeKeybinds(result?.keybinds),
      isLoaded: true,
    });

    await refreshGlobalHotkeys();
  },

  async setBinding(targetId, binding) {
    if (!targetId || !binding) {
      return {
        success: false,
        error: "Missing keybind target.",
      };
    }

    const keys = Array.isArray(binding.keys) ? binding.keys : [];
    const enabled = !!binding.enabled && keys.length > 0;

    const conflict = enabled
      ? findKeybindConflict(state.keybinds.bindings, targetId, keys)
      : null;

    if (conflict) {
      return {
        success: false,
        error: `This keybind is already used by "${
          conflict.binding.label || conflict.targetId
        }".`,
        conflict,
      };
    }

    return await saveKeybinds({
      ...state.keybinds,
      bindings: {
        ...state.keybinds.bindings,
        [targetId]: {
          ...binding,
          enabled,
          keys,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  },

  async clearBinding(targetId) {
    if (!targetId) {
      return {
        success: false,
        error: "Missing keybind target.",
      };
    }

    const nextBindings = {
      ...state.keybinds.bindings,
    };

    delete nextBindings[targetId];

    return await saveKeybinds({
      ...state.keybinds,
      bindings: nextBindings,
    });
  },
};