import { useEffect, useMemo, useState } from "react";
import AutomationEditor from "./AutomationEditor";
import { Button, IconButton } from "../../components/ui";

function stringifyAutomation(value) {
  return JSON.stringify(value || {});
}

function AutomationEditorModal({
  automation,
  isSavedAutomation,
  onSave,
  onClose,
  onRunBlock,
}) {
  const [localAutomation, setLocalAutomation] = useState(automation);
  const [savedSnapshot, setSavedSnapshot] = useState(stringifyAutomation(automation));
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [pendingCloseAfterSave, setPendingCloseAfterSave] = useState(false);
  const [nameValue, setNameValue] = useState(automation?.name || "");

  useEffect(() => {
    setLocalAutomation(automation);
    setSavedSnapshot(stringifyAutomation(automation));
    setNameValue(automation?.name || "");
  }, [automation]);

  const hasUnsavedChanges = useMemo(() => {
    return stringifyAutomation(localAutomation) !== savedSnapshot;
  }, [localAutomation, savedSnapshot]);

  if (!localAutomation) return null;

  function needsNameBeforeFirstSave() {
    return !isSavedAutomation && !String(localAutomation.name || "").trim();
  }

  async function saveOnly(overrideName) {
    const cleanName = String(overrideName ?? localAutomation.name ?? "").trim();

    if (!cleanName) {
      setNameValue("");
      setShowNamePopup(true);
      return false;
    }

    const automationToSave = {
      ...localAutomation,
      name: cleanName,
      updatedAt: new Date().toISOString(),
    };

    await onSave(automationToSave);

    setLocalAutomation(automationToSave);
    setSavedSnapshot(stringifyAutomation(automationToSave));

    return true;
  }

  async function handleSaveClick() {
    if (needsNameBeforeFirstSave()) {
      setPendingCloseAfterSave(false);
      setShowNamePopup(true);
      return;
    }

    await saveOnly();
  }

  function requestClose() {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    setShowUnsavedPopup(true);
  }

  async function saveAndExit() {
    if (needsNameBeforeFirstSave()) {
      setPendingCloseAfterSave(true);
      setShowUnsavedPopup(false);
      setShowNamePopup(true);
      return;
    }

    const saved = await saveOnly();

    if (saved) {
      onClose();
    }
  }

  function discardAndExit() {
    setShowUnsavedPopup(false);
    onClose();
  }

  async function confirmNameSave() {
    const cleanName = nameValue.trim();
    if (!cleanName) return;

    const saved = await saveOnly(cleanName);

    setShowNamePopup(false);

    if (saved && pendingCloseAfterSave) {
      onClose();
    }

    setPendingCloseAfterSave(false);
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {localAutomation.name || "Unsaved Automation"}
            </h2>
            <div style={styles.subtitle}>
              Automation Editor {hasUnsavedChanges ? "• Unsaved changes" : ""}
            </div>
          </div>

          <div style={styles.headerButtons}>
            <Button variant="save" onClick={handleSaveClick} style={styles.saveButton}>
              Save Automation
            </Button>

            <IconButton
              variant="cancel"
              size={38}
              onClick={requestClose}
              style={styles.closeButton}
            >
              ×
            </IconButton>
          </div>
        </div>

        <div style={styles.body}>
          <AutomationEditor
            automation={localAutomation}
            onUpdateAutomation={setLocalAutomation}
            onRunBlock={(block) => {
              if (typeof onRunBlock === "function") {
                onRunBlock(localAutomation, block.id);
              }
            }}
          />
        </div>
      </div>

      {showUnsavedPopup && (
        <CustomPopup
          title="Unsaved changes"
          message="You have unsaved changes. Do you want to save them before closing?"
          onClose={() => setShowUnsavedPopup(false)}
        >
          <button style={styles.secondaryPopupButton} onClick={() => setShowUnsavedPopup(false)}>
            Cancel
          </button>

          <button style={styles.dangerPopupButton} onClick={discardAndExit}>
            Don’t Save
          </button>

          <button style={styles.primaryPopupButton} onClick={saveAndExit}>
            Save & Exit
          </button>
        </CustomPopup>
      )}

      {showNamePopup && (
        <CustomPopup
          title="Name automation"
          message="Choose a name before saving this automation."
          onClose={() => {
            setShowNamePopup(false);
            setPendingCloseAfterSave(false);
          }}
        >
          <input
            style={styles.popupInput}
            value={nameValue}
            autoFocus
            placeholder="Example: Make YouTube Short"
            onChange={(event) => setNameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") confirmNameSave();
              if (event.key === "Escape") {
                setShowNamePopup(false);
                setPendingCloseAfterSave(false);
              }
            }}
          />

          <div style={styles.popupButtonRow}>
            <button
              style={styles.secondaryPopupButton}
              onClick={() => {
                setShowNamePopup(false);
                setPendingCloseAfterSave(false);
              }}
            >
              Cancel
            </button>

            <button style={styles.primaryPopupButton} onClick={confirmNameSave}>
              Save
            </button>
          </div>
        </CustomPopup>
      )}
    </div>
  );
}

function CustomPopup({ title, message, children, onClose }) {
  return (
    <div style={styles.popupBackdrop}>
      <div style={styles.popupBox}>
        <div style={styles.popupHeader}>
          <div>
            <h3 style={styles.popupTitle}>{title}</h3>
            <p style={styles.popupMessage}>{message}</p>
          </div>

          <button style={styles.popupCloseButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.popupActions}>{children}</div>
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

  popupBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  popupBox: {
    width: "430px",
    backgroundColor: "#181818",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
  },

  popupHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
  },

  popupTitle: {
    margin: "0 0 8px",
    fontSize: "22px",
  },

  popupMessage: {
    margin: 0,
    color: "#cfcfcf",
    lineHeight: 1.45,
    fontSize: "14px",
  },

  popupCloseButton: {
    width: "34px",
    height: "34px",
    border: "1px solid #333",
    borderRadius: "9px",
    backgroundColor: "#252525",
    color: "white",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
  },

  popupActions: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },

  popupButtonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    width: "100%",
  },

  popupInput: {
    width: "100%",
    backgroundColor: "#101010",
    border: "1px solid #333",
    borderRadius: "9px",
    color: "white",
    padding: "10px 12px",
    outline: "none",
    fontWeight: "bold",
  },

  primaryPopupButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#5b35ff",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  secondaryPopupButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#2b2b2b",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  dangerPopupButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#7a1f1f",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default AutomationEditorModal;