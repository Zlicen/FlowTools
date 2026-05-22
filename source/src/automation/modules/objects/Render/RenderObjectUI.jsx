import {
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

function RenderObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={[
            { value: "set", label: "Set render job" },
            { value: "delete", label: "Delete render job" },
            { value: "render", label: "Start render" },
          ]}
        />
      </ModuleSettingsField>

      {(action === "set" || action === "render") && (
        <>
          <ModuleSettingsField label="Timeline">
            <ModuleSelect
              value={settings.renderMode || "currentTimeline"}
              onChange={(value) => update("renderMode", value)}
              options={[
                { value: "currentTimeline", label: "Current timeline" },
              ]}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Preset">
            <ModuleSelect
              value={settings.preset || "current"}
              onChange={(value) => update("preset", value)}
              options={[
                { value: "current", label: "Current render settings" },
              ]}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Output name">
            <ModuleTextInput
              value={settings.outputName || ""}
              placeholder="Optional filename..."
              onChange={(value) => update("outputName", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Output folder">
            <ModuleTextInput
              value={settings.outputFolder || ""}
              placeholder="Optional folder path..."
              onChange={(value) => update("outputFolder", value)}
            />
          </ModuleSettingsField>
        </>
      )}
    </ModuleSettingsBox>
  );
}

export default RenderObjectUI;