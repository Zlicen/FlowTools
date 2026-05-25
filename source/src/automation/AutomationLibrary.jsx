import { useEffect, useRef, useState } from "react";

import { Button } from "../components/ui";
import {
  createKeybindTargetId,
  findKeybindConflict,
  formatHotkey,
  normalizeKeyboardEvent,
} from "../keybinds";

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

  if (!automation || typeof automation !== "object") return null;

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
  keybindBindings = {},
  onAddAutomation,
  onDeleteAutomation,
  onRenameAutomation,
  onEditAutomation,
  onRunAutomation,
  onImportAutomation,
  onSetKeybind,
  onClearKeybind,
}) {
  const fileInputRef = useRef(null);
  const hotkeyRecorderRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [messagePopup, setMessagePopup] = useState(null);
  const [hotkeyTarget, setHotkeyTarget] = useState(null);
  const [recordedHotkey, setRecordedHotkey] = useState([]);

  useEffect(() => {
  if (!hotkeyTarget) {
    delete document.body.dataset.flowtoolsRecordingHotkey;
    return;
  }

  document.body.dataset.flowtoolsRecordingHotkey = "true";

  const timeoutId = setTimeout(() => {
    hotkeyRecorderRef.current?.focus();
  }, 0);

  return () => {
    clearTimeout(timeoutId);
    delete document.body.dataset.flowtoolsRecordingHotkey;
  };
}, [hotkeyTarget]);

function getRecordedHotkeyConflict() {
  if (!hotkeyTarget || !recordedHotkey?.length) return null;

  const targetId = createKeybindTargetId("automation", hotkeyTarget.id);

  return findKeybindConflict(keybindBindings, targetId, recordedHotkey);
}

  function getAutomationKeybind(automation) {
    const targetId = createKeybindTargetId("automation", automation.id);
    return keybindBindings?.[targetId] || null;
  }

  async function handleRunAutomation(automation) {
    if (typeof onRunAutomation !== "function") return;
    await onRunAutomation(automation);
  }

  async function confirmHotkey() {
    if (!hotkeyTarget || typeof onSetKeybind !== "function") return;

    const conflict = getRecordedHotkeyConflict();

if (conflict) {
  setMessagePopup({
    title: "Keybind already used",
    message: `This keybind is already used by "${
      conflict.binding.label || conflict.targetId
    }".`,
  });
  return;
}

    const result = await onSetKeybind(hotkeyTarget, recordedHotkey || []);

    if (result?.success === false) {
      setMessagePopup({
        title: "Keybind already used",
        message: result.error || "This keybind is already assigned.",
      });
      return;
    }

    setHotkeyTarget(null);
    setRecordedHotkey([]);
  }

  async function clearHotkey() {
    if (!hotkeyTarget || typeof onClearKeybind !== "function") return;

    await onClearKeybind(hotkeyTarget);

    setHotkeyTarget(null);
    setRecordedHotkey([]);
  }

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
        message:
          "Could not read this automation file. Make sure it is a valid JSON export.",
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
          <Button variant="add" size="sm" onClick={onAddAutomation}>
            + Add Automation
          </Button>

          <Button
            variant="import"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Import Automation
          </Button>
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
          const keybind = getAutomationKeybind(automation);

          return (
            <div key={automation.id} style={styles.item}>
              <div style={styles.infoArea}>
                <div style={styles.nameLine}>
                  <span style={styles.name}>{automation.name}</span>

                  {keybind?.enabled && keybind?.keys?.length > 0 && (
                    <span style={styles.hotkeyBadge}>
                      {formatHotkey(keybind)}
                    </span>
                  )}
                </div>

                <div style={styles.meta}>
                  Blocks: {getAutomationStepCount(automation)}
                </div>
              </div>

              <div style={styles.buttons}>
                <Button
                  variant="run"
                  size="sm"
                  disabled={isRunning}
                  onClick={() => handleRunAutomation(automation)}
                >
                  {isRunning ? "Running..." : "Run"}
                </Button>

                <Button
                  variant="edit"
                  size="sm"
                  onClick={() => onEditAutomation(automation.id)}
                >
                  Edit
                </Button>

                <Button
                  variant="keybind"
                  size="sm"
                  onClick={() => {
                    setHotkeyTarget(automation);
                    setRecordedHotkey(keybind?.keys || []);
                  }}
                >
                  Keybind
                </Button>

                <Button
                  variant="rename"
                  size="sm"
                  onClick={() => openRenamePopup(automation)}
                >
                  Rename
                </Button>

                <Button
                  variant="export"
                  size="sm"
                  onClick={() => exportAutomation(automation)}
                >
                  Export
                </Button>

                <Button
                  variant="delete"
                  size="sm"
                  onClick={() => setDeleteTarget(automation)}
                >
                  Delete
                </Button>
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
          <Button variant="rename" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>

          <Button variant="delete" size="sm" onClick={confirmDelete}>
            Delete
          </Button>
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
            <Button
              variant="rename"
              size="sm"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>

            <Button variant="save" size="sm" onClick={confirmRename}>
              Rename
            </Button>
          </div>
        </CustomPopup>
      )}

      {hotkeyTarget && (
        <CustomPopup
          title="Set keybind"
          message={`Choose a keybind for "${hotkeyTarget.name}".`}
          onClose={() => {
            setHotkeyTarget(null);
            setRecordedHotkey([]);
          }}
        >
          <div
            ref={hotkeyRecorderRef}
            tabIndex={0}
            style={styles.hotkeyRecorder}
            onKeyDown={(event) => {
              event.preventDefault();
              event.stopPropagation();

              const keys = normalizeKeyboardEvent(event);

              if (keys.length > 0) {
                setRecordedHotkey(keys);
              }
            }}
          >
            <span>Press keys...</span>
            <strong>{formatHotkey({ keys: recordedHotkey || [] })}</strong>
          </div>

          {getRecordedHotkeyConflict() && (
  <div style={styles.hotkeyConflict}>
    Already used by{" "}
    <strong>
      {getRecordedHotkeyConflict().binding.label ||
        getRecordedHotkeyConflict().targetId}
    </strong>
  </div>
)}

<div style={styles.popupButtonRow}>
            <Button variant="rename" size="sm" onClick={clearHotkey}>
              Clear
            </Button>

            <Button
              variant="rename"
              size="sm"
              onClick={() => {
                setHotkeyTarget(null);
                setRecordedHotkey([]);
              }}
            >
              Cancel
            </Button>

            <Button variant="save" size="sm" onClick={confirmHotkey}>
              Save
            </Button>
          </div>
        </CustomPopup>
      )}

      {messagePopup && (
        <CustomPopup
          title={messagePopup.title}
          message={messagePopup.message}
          onClose={() => setMessagePopup(null)}
        >
          <Button variant="save" size="sm" onClick={() => setMessagePopup(null)}>
            OK
          </Button>
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

  headerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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

  infoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: 0,
  },

  nameLine: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "6px",
    minWidth: 0,
  },

  name: {
    fontWeight: "bold",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  hotkeyBadge: {
    flexShrink: 0,
    borderRadius: "7px",
    padding: "3px 7px",
    backgroundColor: "#2b210b",
    border: "1px solid #a16207",
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: "900",
    lineHeight: 1,
    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.35)",
  },

  meta: {
    color: "#bbb",
    fontSize: "12px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
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

  hotkeyRecorder: {
    width: "100%",
    minHeight: "86px",
    border: "1px dashed #555",
    borderRadius: "12px",
    backgroundColor: "#101010",
    color: "#bbb",
    display: "grid",
    placeItems: "center",
    gap: "8px",
    outline: "none",
    fontSize: "13px",
  },

  hotkeyConflict: {
  width: "100%",
  border: "1px solid rgba(185,28,28,0.55)",
  backgroundColor: "rgba(185,28,28,0.16)",
  color: "#fecaca",
  borderRadius: "10px",
  padding: "9px 10px",
  fontSize: "12px",
  fontWeight: "700",
},
};

export default AutomationLibrary;