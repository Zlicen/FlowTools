import { useEffect, useState } from "react";
import AutomationEditor from "./AutomationEditor";
import { Button, IconButton } from "../../components/ui";

function AutomationEditorModal({ automation, onSave, onClose }) {
  const [localAutomation, setLocalAutomation] = useState(automation);

  useEffect(() => {
    setLocalAutomation(automation);
  }, [automation]);

  if (!localAutomation) return null;

  function saveAndClose() {
    onSave({
      ...localAutomation,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{localAutomation.name}</h2>
            <div style={styles.subtitle}>Automation Editor</div>
          </div>

          <div style={styles.headerButtons}>
            <Button variant="save" onClick={saveAndClose} style={styles.saveButton}>
              Save
            </Button>

            <IconButton variant="cancel" size={38} onClick={onClose} style={styles.closeButton}>
              ×
            </IconButton>
          </div>
        </div>

        <div style={styles.body}>
          <AutomationEditor
            automation={localAutomation}
            onUpdateAutomation={setLocalAutomation}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    width: "92vw",
    height: "88vh",
    backgroundColor: "#151515",
    border: "1px solid #333",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  header: {
    padding: "16px 18px",
    borderBottom: "1px solid #333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "22px",
  },

  subtitle: {
    color: "#aaa",
    fontSize: "12px",
    marginTop: "4px",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
  },

  saveButton: {
    backgroundColor: "#5b35ff",
    color: "white",
    border: "none",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid #333",
    backgroundColor: "#252525",
    color: "white",
    cursor: "pointer",
    fontSize: "24px",
  },

  body: {
    flex: 1,
    padding: "18px",
    overflow: "hidden",
  },
};

export default AutomationEditorModal;