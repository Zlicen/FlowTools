import { EmptyState, Panel, SectionHeader } from "../components/ui";

function SettingsTab() {
  return (
    <Panel>
      <SectionHeader
        title="Settings"
        description="Panel-wide settings will be added here."
      />

      <EmptyState
        title="Settings page coming soon"
        description="The settings modal already uses the shared UI components. This tab can later hold persistent preferences and presets."
      />
    </Panel>
  );
}

export default SettingsTab;
