import { useEffect } from "react";

import AutomationLibrary from "../automation/AutomationLibrary";
import AutomationEditorModal from "../automation/editor/AutomationEditorModal";
import { Panel } from "../components/ui";
import { automationStore, useAutomationStore } from "../store";
import { keybindStore, useKeybindStore } from "../keybinds";
import {
  createKeybindTargetId,
  hotkeysMatch,
  normalizeKeyboardEvent,
} from "../keybinds";
import { getAutomationModuleCapabilities } from "../api/automationAPI";
import { setBackendModuleCapabilities } from "../automation/modules/moduleCompatibility";

function shouldIgnoreHotkeyEvent(event) {
  if (document.body?.dataset.flowtoolsRecordingHotkey === "true") {
    return true;
  }

  const target = event.target;

  if (!target) return false;

  const tagName = String(target.tagName || "").toLowerCase();

  if (tagName === "input") return true;
  if (tagName === "textarea") return true;
  if (tagName === "select") return true;
  if (target.isContentEditable) return true;

  return false;
}

function AutomationTab() {
  const { automations, editorAutomation, runningAutomationId } =
    useAutomationStore();

  const { keybinds } = useKeybindStore();

  useEffect(() => {
    automationStore.load();
    keybindStore.load();

    getAutomationModuleCapabilities()
      .then((result) => {
        if (result?.success) {
          setBackendModuleCapabilities(result.capabilities);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (shouldIgnoreHotkeyEvent(event)) return;

      const pressedKeys = normalizeKeyboardEvent(event);
      if (pressedKeys.length === 0) return;

      for (const [targetId, binding] of Object.entries(
        keybinds.bindings || {}
      )) {
        if (!binding?.enabled) continue;
        if (binding.targetType !== "automation") continue;
        if (!hotkeysMatch(binding.keys, pressedKeys)) continue;

        const automation = automations.find(
          (item) => item.id === binding.targetId
        );

        if (!automation) return;

        event.preventDefault();
        event.stopPropagation();

        if (runningAutomationId) return;

        automationStore.runAutomation(automation);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [automations, keybinds, runningAutomationId]);

  function handleAddAutomation() {
    automationStore.openDraftEditor("");
  }

  return (
    <Panel style={styles.pagePanel}>
      <h1 style={styles.title}>Automation</h1>

      <AutomationLibrary
        automations={automations}
        runningAutomationId={runningAutomationId}
        keybindBindings={keybinds.bindings}
        onAddAutomation={handleAddAutomation}
        onDeleteAutomation={automationStore.deleteAutomation}
        onRenameAutomation={automationStore.renameAutomation}
        onEditAutomation={automationStore.openEditor}
        onRunAutomation={automationStore.runAutomation}
        onImportAutomation={automationStore.importAutomation}
        onSetKeybind={async (automation, keys) => {
          const targetId = createKeybindTargetId("automation", automation.id);

          return await keybindStore.setBinding(targetId, {
            targetType: "automation",
            targetId: automation.id,
            label: automation.name || "Unnamed Automation",
            enabled: keys.length > 0,
            keys,
          });
        }}
        onClearKeybind={async (automation) => {
          const targetId = createKeybindTargetId("automation", automation.id);
          return await keybindStore.clearBinding(targetId);
        }}
      />

      {editorAutomation && (
        <AutomationEditorModal
          automation={editorAutomation}
          isSavedAutomation={automations.some(
            (automation) => automation.id === editorAutomation.id
          )}
          onSave={automationStore.saveFromEditor}
          onClose={automationStore.closeEditor}
          onRunBlock={automationStore.runAutomationBlock}
        />
      )}
    </Panel>
  );
}

const styles = {
  pagePanel: {
    height: "100%",
    overflow: "auto",
  },

  title: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "32px",
    lineHeight: 1.1,
  },
};

export default AutomationTab;