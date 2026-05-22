import { useState } from "react";
import { Button, Card, Toolbar } from "../components/ui";

function AutomationCreate({ onCreateAutomation, onEditDraft }) {
  const [automationName, setAutomationName] = useState("");
  const [message, setMessage] = useState("");

  function getCleanName() {
    return automationName.trim();
  }

  function saveAutomation() {
    const cleanName = getCleanName();

    if (!cleanName) {
      setMessage("Give the automation a name first.");
      return;
    }

    onCreateAutomation(cleanName);
    setAutomationName("");
    setMessage("Automation saved to library.");
    setTimeout(() => setMessage(""), 2500);
  }

  function editAutomation() {
    const cleanName = getCleanName();

    if (!cleanName) {
      setMessage("Give the automation a name first.");
      return;
    }

    onEditDraft(cleanName);
  }

  return (
    <Card>
      <h2 style={styles.sectionTitle}>Create New Automation</h2>

      <label style={styles.field}>
        <span style={styles.label}>Automation name</span>
        <input
          style={styles.input}
          value={automationName}
          onChange={(event) => setAutomationName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") editAutomation();
          }}
          placeholder="Example: Make YouTube Short"
        />
      </label>

      {message && <div style={styles.message}>{message}</div>}

      <Toolbar>
        <Button variant="edit" onClick={editAutomation}>
          Edit
        </Button>

        <Button variant="save" onClick={saveAutomation}>
          Save Automation
        </Button>
      </Toolbar>
    </Card>
  );
}

const styles = {
  sectionTitle: {
    marginTop: 0,
    marginBottom: "14px",
    fontSize: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },

  label: {
    color: "#aaa",
    fontSize: "12px",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#111",
    color: "white",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "10px",
    outline: "none",
    fontSize: "14px",
  },

  message: {
    color: "#4ade80",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
};

export default AutomationCreate;
