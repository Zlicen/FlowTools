import { Card, EmptyState, Panel, SectionHeader } from "../components/ui";

function ToolsTab() {
  return (
    <Panel>
      <SectionHeader
        title="Tools"
        description="Fast standalone Resolve tools live here, separate from saved automations."
      />

      <div style={styles.toolGrid}>
        <Card>
          <h2 style={styles.toolTitle}>Coming Next</h2>
          <p style={styles.toolText}>
            We can build small one-click tools here, then later turn useful ones into automation modules.
          </p>
        </Card>
      </div>

      <EmptyState
        style={styles.emptyState}
        title="No tools added yet"
        description="The shared UI system is ready, so new tools will use the same buttons, cards, and behavior patterns as the rest of the app."
      />
    </Panel>
  );
}

const styles = {
  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },

  toolTitle: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "18px",
  },

  toolText: {
    margin: 0,
    color: "#aaa",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  emptyState: {
    marginTop: "18px",
  },
};

export default ToolsTab;
