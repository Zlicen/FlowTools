import {
  runAutomation as runAutomationInResolve,
  runAutomationBlock as runAutomationBlockInResolve,
} from "../api/automationAPI";

import {
  createAutomationId,
  loadAutomations,
  saveAutomations as saveAutomationsToStorage,
} from "../automation/automationStorage";

function createAutomation(name) {
  return {
    id: createAutomationId(),
    name,
    steps: [],
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cloneAutomation(automation) {
  return JSON.parse(JSON.stringify(automation));
}

const subscribers = new Set();

let state = {
  automations: [],
  editorAutomation: null,
  runMessage: "",
  isLoaded: false,
  runningAutomationId: null,
};

function emit() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function setState(updater) {
  const nextState =
    typeof updater === "function" ? updater(state) : { ...state, ...updater };

  state = nextState;
  emit();
}

async function saveAutomations(nextAutomations) {
  await saveAutomationsToStorage(nextAutomations);
  setState({ automations: nextAutomations, isLoaded: true });
}

function getAutomationById(id) {
  return state.automations.find((automation) => automation.id === id) || null;
}

export const automationStore = {
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  getSnapshot() {
    return state;
  },

  async load() {
    if (state.isLoaded) return;

    const automations = await loadAutomations();

    setState({
      automations,
      isLoaded: true,
    });
  },

  async createAutomation(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return null;

    const automation = createAutomation(cleanName);

    await saveAutomations([...state.automations, automation]);

    return automation;
  },

  openDraftEditor(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return;

    setState({
      editorAutomation: createAutomation(cleanName),
    });
  },

  openEditor(id) {
    const automation = getAutomationById(id);
    if (!automation) return;

    setState({
      editorAutomation: cloneAutomation(automation),
    });
  },

  closeEditor() {
    setState({
      editorAutomation: null,
    });
  },

  async saveFromEditor(updatedAutomation) {
    if (!updatedAutomation) return;

    const automationToSave = {
      ...updatedAutomation,
      updatedAt: new Date().toISOString(),
    };

    const exists = state.automations.some(
      (automation) => automation.id === automationToSave.id
    );

    const nextAutomations = exists
      ? state.automations.map((automation) =>
          automation.id === automationToSave.id ? automationToSave : automation
        )
      : [...state.automations, automationToSave];

    await saveAutomations(nextAutomations);

    setState({
      editorAutomation: null,
    });
  },

  async deleteAutomation(id) {
    await saveAutomations(
      state.automations.filter((automation) => automation.id !== id)
    );
  },

  async renameAutomation(id, newName) {
    const cleanName = String(newName || "").trim();
    if (!cleanName) return;

    await saveAutomations(
      state.automations.map((automation) =>
        automation.id === id
          ? {
              ...automation,
              name: cleanName,
              updatedAt: new Date().toISOString(),
            }
          : automation
      )
    );
  },

  async importAutomation(importedAutomation) {
    if (!importedAutomation) return null;

    const now = new Date().toISOString();

    const importedName =
      String(importedAutomation.name || "").trim() || "Imported Automation";

    const automation = {
      ...importedAutomation,
      id: createAutomationId(),
      name: importedName,
      createdAt: now,
      updatedAt: now,
      blocks: Array.isArray(importedAutomation.blocks)
        ? importedAutomation.blocks
        : [],
      steps: Array.isArray(importedAutomation.steps)
        ? importedAutomation.steps
        : [],
    };

    await saveAutomations([...state.automations, automation]);

    return automation;
  },

  async runAutomation(automation) {
    if (!automation) return;

    setState({
      runningAutomationId: automation.id,
    });

    const result = await runAutomationInResolve(automation);

    setState({
      runningAutomationId: null,
    });

    return result;
  },

  async runAutomationBlock(automation, blockId) {
    if (!automation || !blockId) return;

    const block = (automation.blocks || []).find((item) => item.id === blockId);
    const blockName = block?.name || "Block";

    setState({
      runMessage: `Running block "${blockName}"...`,
    });

    const result = await runAutomationBlockInResolve(automation, blockId);

    if (!result?.success) {
      setState({
        runMessage: result?.error || "Block failed.",
      });
      return;
    }

    setState({
      runMessage: `Finished block "${blockName}".`,
    });

    window.setTimeout(() => {
      if (state.runMessage === `Finished block "${blockName}".`) {
        setState({
          runMessage: "",
        });
      }
    }, 2500);
  },
};