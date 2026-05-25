import { useEffect } from "react";

import AutomationLibrary from "../automation/AutomationLibrary";
import AutomationEditorModal from "../automation/editor/AutomationEditorModal";
import { Panel } from "../components/ui";
import { automationStore, useAutomationStore } from "../store";
import { getAutomationModuleCapabilities } from "../api/automationAPI";
import { setBackendModuleCapabilities } from "../automation/modules/moduleCompatibility";

function AutomationTab() {
  const { automations, editorAutomation, runningAutomationId } =
    useAutomationStore();

  useEffect(() => {
    automationStore.load();

    getAutomationModuleCapabilities()
      .then((result) => {
        if (result?.success) {
          setBackendModuleCapabilities(result.capabilities);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Panel style={styles.pagePanel}>
      <h1 style={styles.title}>Automation</h1>

      <AutomationLibrary
        automations={automations}
        runningAutomationId={runningAutomationId}
        onAddAutomation={() => automationStore.openDraftEditor("")}
        onDeleteAutomation={automationStore.deleteAutomation}
        onRenameAutomation={automationStore.renameAutomation}
        onEditAutomation={automationStore.openEditor}
        onRunAutomation={automationStore.runAutomation}
        onImportAutomation={(automation) =>
          automationStore.importAutomation(automation)
        }
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