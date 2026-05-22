import { useEffect } from "react";

import AutomationLibrary from "../automation/AutomationLibrary";
import AutomationCreate from "../automation/AutomationCreate";
import AutomationEditorModal from "../automation/editor/AutomationEditorModal";
import { Panel } from "../components/ui";
import { automationStore, useAutomationStore } from "../store";
import { getAutomationModuleCapabilities } from "../api/automationAPI";
import { setBackendModuleCapabilities } from "../automation/modules/moduleCompatibility";

function AutomationTab() {
  const { automations, editorAutomation, runMessage } = useAutomationStore();

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

      {runMessage && <div style={styles.runMessage}>{runMessage}</div>}

      <div style={styles.page}>
        <AutomationCreate
          onCreateAutomation={automationStore.createAutomation}
          onEditDraft={automationStore.openDraftEditor}
        />

        <AutomationLibrary
          automations={automations}
          onDeleteAutomation={automationStore.deleteAutomation}
          onRenameAutomation={automationStore.renameAutomation}
          onEditAutomation={automationStore.openEditor}
          onRunAutomation={automationStore.runAutomation}
        />
      </div>

      {editorAutomation && (
        <AutomationEditorModal
          automation={editorAutomation}
          onSave={automationStore.saveFromEditor}
          onClose={automationStore.closeEditor}
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

  page: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  runMessage: {
    backgroundColor: "#202020",
    border: "1px solid #333",
    color: "#ddd",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "14px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};

export default AutomationTab;
