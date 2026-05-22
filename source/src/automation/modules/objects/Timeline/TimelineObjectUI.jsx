import {
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "set", label: "Set" },
  { value: "rename", label: "Rename" },
  { value: "duplicate", label: "Duplicate" },
  { value: "delete", label: "Delete" },
  { value: "render", label: "Render" },
];

function TimelineObjectUI({ module, onUpdate }) {
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

  const needsTimelineFinder =
    action === "rename" ||
    action === "duplicate" ||
    action === "delete" ||
    action === "render";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      {needsTimelineFinder && (
        <ModuleSettingsField label="Timeline">
          <ModuleSelect
            value={settings.findMode || "current"}
            onChange={(value) => update("findMode", value)}
            options={[
              { value: "current", label: "Current timeline" },
              { value: "name", label: "By name" },
            ]}
          />
        </ModuleSettingsField>
      )}

      {(action === "set" || settings.findMode === "name") && (
        <ModuleSettingsField label="Timeline name">
          <ModuleTextInput
            value={settings.name || ""}
            placeholder="Timeline name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New timeline name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate name">
          <ModuleTextInput
            value={settings.duplicateName || ""}
            placeholder="Optional duplicate name..."
            onChange={(value) => update("duplicateName", value)}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default TimelineObjectUI;