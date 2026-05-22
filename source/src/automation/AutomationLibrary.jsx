import { useState } from "react";
import { Button, Card, Toolbar } from "../components/ui";

function AutomationLibrary({
  automations,
  onDeleteAutomation,
  onRenameAutomation,
  onEditAutomation,
  onRunAutomation,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  function startRename(automation) {
    setRenamingId(automation.id);
    setRenameValue(automation.name);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }

  function saveRename(automationId) {
    const cleanName = renameValue.trim();
    if (!cleanName) return;

    onRenameAutomation(automationId, cleanName);
    cancelRename();
  }

  return (
    <Card>
      <h2 style={styles.sectionTitle}>Library</h2>

      {automations.length === 0 && (
        <p style={styles.emptyText}>No saved automations yet.</p>
      )}

      <div style={styles.libraryGrid}>
        {automations.map((automation) => {
          const isRenaming = renamingId === automation.id;

          return (
            <div key={automation.id} style={styles.automationCard}>
              <div style={styles.infoSide}>
                {isRenaming ? (
                  <input
                    style={styles.renameInput}
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveRename(automation.id);
                      if (event.key === "Escape") cancelRename();
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={styles.automationName}>{automation.name}</div>
                )}

                <div style={styles.automationMeta}>
                  Steps: {automation.steps?.length || automation.blocks?.length || 0}
                </div>
              </div>

              <Toolbar style={styles.buttonRow}>
                {isRenaming ? (
                  <>
                    <Button
                      size="sm"
                      variant="save"
                      onClick={() => saveRename(automation.id)}
                    >
                      Save
                    </Button>

                    <Button size="sm" variant="cancel" onClick={cancelRename}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="run"
                      onClick={() => onRunAutomation(automation)}
                    >
                      Run
                    </Button>

                    <Button
                      size="sm"
                      variant="edit"
                      onClick={() => onEditAutomation(automation.id)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="rename"
                      onClick={() => startRename(automation)}
                    >
                      Rename
                    </Button>

                    <Button
                      size="sm"
                      variant="delete"
                      onClick={() => onDeleteAutomation(automation.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Toolbar>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const styles = {
  sectionTitle: {
    marginTop: 0,
    marginBottom: "14px",
    fontSize: "20px",
  },

  emptyText: {
    color: "#aaa",
    margin: 0,
  },

  libraryGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  automationCard: {
    backgroundColor: "#242424",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },

  infoSide: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  automationName: {
    fontWeight: "bold",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  automationMeta: {
    color: "#aaa",
    fontSize: "12px",
    marginTop: "8px",
  },

  renameInput: {
    backgroundColor: "#111",
    color: "white",
    border: "1px solid #444",
    borderRadius: "8px",
    padding: "10px 11px",
    outline: "none",
    minWidth: "220px",
    fontSize: "14px",
  },

  buttonRow: {
    marginLeft: "auto",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
};

export default AutomationLibrary;
