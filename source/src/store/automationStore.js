import { runAutomation as runAutomationInResolve } from "../api/automationAPI";
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const subscribers = new Set();

let state = {
  automations: [],
  editorAutomation: null,
  runMessage: "",
  isLoaded: false,
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

function saveAutomations(nextAutomations) {
  saveAutomationsToStorage(nextAutomations);
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

  load() {
    if (state.isLoaded) return;

    setState({
      automations: loadAutomations(),
      isLoaded: true,
    });
  },

  createAutomation(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return null;

    const automation = createAutomation(cleanName);
    saveAutomations([...state.automations, automation]);

    return automation;
  },

  openDraftEditor(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return;

    setState({ editorAutomation: createAutomation(cleanName) });
  },

  openEditor(id) {
    const automation = getAutomationById(id);
    if (!automation) return;

    setState({ editorAutomation: automation });
  },

  closeEditor() {
    setState({ editorAutomation: null });
  },

  saveFromEditor(updatedAutomation) {
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

    saveAutomations(nextAutomations);
    setState({ editorAutomation: null });
  },

  deleteAutomation(id) {
    saveAutomations(
      state.automations.filter((automation) => automation.id !== id)
    );
  },

  renameAutomation(id, newName) {
    const cleanName = String(newName || "").trim();
    if (!cleanName) return;

    saveAutomations(
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

  async runAutomation(automation) {
    if (!automation) return;

    setState({ runMessage: `Running "${automation.name}"...` });

    const result = await runAutomationInResolve(automation);

    if (!result.success) {
      setState({ runMessage: result.error || "Automation failed." });
      return;
    }

    setState({ runMessage: `Finished "${automation.name}".` });

    window.setTimeout(() => {
      if (state.runMessage === `Finished "${automation.name}".`) {
        setState({ runMessage: "" });
      }
    }, 2500);
  },
};
