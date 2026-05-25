import { useRef, useState } from "react";

function sanitizeFileName(value) {
  return String(value || "automation")
    .replace(/[<>:"/\\|?*]+/g, "_")
    .replace(/\s+/g, "_");
}

function getAutomationStepCount(automation) {
  if (Array.isArray(automation.blocks)) return automation.blocks.length;
  if (Array.isArray(automation.steps)) return automation.steps.length;
  return 0;
}

function normalizeImportedAutomation(parsed) {
  let automation = null;

  if (parsed?.fileType === "flowtools-automation" && parsed.automation) {
    automation = parsed.automation;
  } else if (parsed?.automation) {
    automation = parsed.automation;
  } else if (parsed?.id || parsed?.name || parsed?.blocks || parsed?.steps) {
    automation = parsed;
  }

  if (!automation || typeof automation !== "object") {
    return null;
  }

  return {
    ...automation,
    name: String(automation.name || "").trim() || "Imported Automation",
    blocks: Array.isArray(automation.blocks) ? automation.blocks : [],
    steps: Array.isArray(automation.steps) ? automation.steps : [],
  };
}

function exportAutomation(automation) {
  const fileName = `${sanitizeFileName(
    automation.name || "automation"
  )}.flowtools-automation.json`;

  const exportData = {
    fileType: "flowtools-automation",
    fileVersion: 1,
    exportedAt: new Date().toISOString(),
    automation,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function AutomationLibrary({
  automations,
  runningAutomationId,
  onAddAutomation,
  onDeleteAutomation,
  onRenameAutomation,
  onEditAutomation,
  onRunAutomation,
  onImportAutomation,
}) {
  const fileInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [messagePopup, setMessagePopup] = useState(null);

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const automation = normalizeImportedAutomation(parsed);

      if (!automation) {
        setMessagePopup({
          title: "Import failed",
          message: "This file is not a valid FlowTools automation.",
        });
        return;
      }

      if (typeof onImportAutomation !== "function") {
        setMessagePopup({
          title: "Import failed",
          message: "Import is not connected in AutomationTab.",
        });
        return;
      }

      await onImportAutomation(automation);

      setMessagePopup({
        title: "Automation imported",
        message: `"${automation.name}" was imported successfully.`,
      });
    } catch (error) {
      console.error("Automation import failed:", error);

      setMessagePopup({
        title: "Import failed",
        message: "Could not read this automation file. Make sure it is a valid JSON export.",
      });
    }
  }

  function openRenamePopup(automation) {
    setRenameTarget(automation);
    setRenameValue(automation.name || "");
  }

  async function confirmRename() {
    const cleanName = renameValue.trim();
    if (!renameTarget || !cleanName) return;

    await onRenameAutomation(renameTarget.id, cleanName);

    setRenameTarget(null);
    setRenameValue("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    await onDeleteAutomation(deleteTarget.id);

    setDeleteTarget(null);
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
  <h2 style={styles.title}>Automations</h2>

  <div style={styles.headerButtons}>
    <button
      style={styles.addButton}
      onClick={onAddAutomation}
    >
      + Add Automation
    </button>

    <button
      style={styles.importButton}
      onClick={() => fileInputRef.current?.click()}
    >
      Import Automation
    </button>
  </div>

  <input
    ref={fileInputRef}
    type="file"
    accept=".json,.flowtools-automation.json,application/json"
    style={{ display: "none" }}
    onChange={handleImportFile}
  />
</div>

      <div style={styles.list}>
        {automations.length === 0 && (
          <div style={styles.empty}>No automations saved yet.</div>
        )}

        {automations.map((automation) => {
          const isRunning = runningAutomationId === automation.id;

          return (
            <div key={automation.id} style={styles.item}>
              <div>
                <div style={styles.name}>{automation.name}</div>
                <div style={styles.meta}>
                  Steps: {getAutomationStepCount(automation)}
                </div>
              </div>

              <div style={styles.buttons}>
                <button
                  style={{
                    ...styles.runButton,
                    ...(isRunning ? styles.disabledButton : {}),
                  }}
                  disabled={isRunning}
                  onClick={() => onRunAutomation(automation)}
                >
                  {isRunning ? "Running..." : "Run"}
                </button>

                <button
                  style={styles.editButton}
                  onClick={() => onEditAutomation(automation.id)}
                >
                  Edit
                </button>

                <button
                  style={styles.renameButton}
                  onClick={() => openRenamePopup(automation)}
                >
                  Rename
                </button>

                <button
                  style={styles.exportButton}
                  onClick={() => exportAutomation(automation)}
                >
                  Export
                </button>

                <button
                  style={styles.deleteButton}
                  onClick={() => setDeleteTarget(automation)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <CustomPopup
          title="Delete automation?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
        >
          <button style={styles.secondaryPopupButton} onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>

          <button style={styles.dangerPopupButton} onClick={confirmDelete}>
            Delete
          </button>
        </CustomPopup>
      )}

      {renameTarget && (
        <CustomPopup
          title="Rename automation"
          message={`Choose a new name for "${renameTarget.name}".`}
          onClose={() => setRenameTarget(null)}
        >
          <input
            style={styles.popupInput}
            value={renameValue}
            autoFocus
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") confirmRename();
              if (event.key === "Escape") setRenameTarget(null);
            }}
          />

          <div style={styles.popupButtonRow}>
            <button style={styles.secondaryPopupButton} onClick={() => setRenameTarget(null)}>
              Cancel
            </button>

            <button style={styles.primaryPopupButton} onClick={confirmRename}>
              Rename
            </button>
          </div>
        </CustomPopup>
      )}

      {messagePopup && (
        <CustomPopup
          title={messagePopup.title}
          message={messagePopup.message}
          onClose={() => setMessagePopup(null)}
        >
          <button style={styles.primaryPopupButton} onClick={() => setMessagePopup(null)}>
            OK
          </button>
        </CustomPopup>
      )}
    </section>
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
  card: {
    backgroundColor: "#151515",
    border: "1px solid #2f2f2f",
    borderRadius: "12px",
    padding: "18px",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    flex: 1,
  },

  importButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 13px",
    backgroundColor: "#5b35ff",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  list: {
    display: "grid",
    gap: "10px",
  },

  empty: {
    color: "#aaa",
    fontSize: "13px",
  },

  item: {
    backgroundColor: "#242424",
    border: "1px solid #333",
    borderRadius: "9px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  name: {
    fontWeight: "bold",
    marginBottom: "6px",
  },

  meta: {
    color: "#bbb",
    fontSize: "12px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  runButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#2f9e44",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  editButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#5b35ff",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  renameButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#2b2b2b",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  exportButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#1f6feb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteButton: {
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    backgroundColor: "#6f1f1f",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
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

  headerButtons: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
},

addButton: {
  border: "none",
  borderRadius: "9px",
  padding: "9px 13px",
  backgroundColor: "#2f9e44",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
},
};

export default AutomationLibrary;