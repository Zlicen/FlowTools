import { IconButton, Panel } from "./ui";

function SettingsModal({ onClose }) {
  return (
    <div style={styles.modalBackdrop} onMouseDown={onClose}>
      <Panel
        style={styles.settingsModal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>

          <IconButton
            size={32}
            variant="delete"
            title="Close settings"
            onClick={onClose}
          >
            ×
          </IconButton>
        </div>

        <div style={styles.body}>
          <div style={styles.infoBox}>
            Automation colors use defaults:
            <br />
            <br />
            🟨 Blocks
            <br />
            🟩 Targets
            <br />
            🟥 Actions
          </div>
        </div>
      </Panel>
    </div>
  );
}

const styles = {
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  settingsModal: {
    width: "420px",
    padding: 0,
  },

  header: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #333",
  },

  title: {
    margin: 0,
  },

  body: {
    padding: "18px",
  },

  infoBox: {
    background: "#111",
    border: "1px solid #333",
    padding: "16px",
    borderRadius: "10px",
    lineHeight: 1.8,
    color: "#aaa",
  },
};

export default SettingsModal;
