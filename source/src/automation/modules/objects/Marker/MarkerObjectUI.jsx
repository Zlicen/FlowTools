import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "set", label: "Set" },
  { value: "delete", label: "Delete" },
  { value: "rename", label: "Rename" },
  { value: "move", label: "Move" },
  { value: "duplicate", label: "Duplicate" },
];

const COLOR_OPTIONS = [
  { value: "Blue", label: "Blue" },
  { value: "Cyan", label: "Cyan" },
  { value: "Green", label: "Green" },
  { value: "Yellow", label: "Yellow" },
  { value: "Red", label: "Red" },
  { value: "Pink", label: "Pink" },
  { value: "Purple", label: "Purple" },
];

function MarkerObjectUI({ module, onUpdate }) {
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

  const needsMarkerPosition =
    action === "delete" ||
    action === "rename" ||
    action === "move" ||
    action === "duplicate";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Marker position">
        <ModuleSelect
          value={settings.timeMode || "playhead"}
          onChange={(value) => update("timeMode", value)}
          options={[
            { value: "playhead", label: "Current playhead" },
            { value: "frame", label: "Frame" },
          ]}
        />
      </ModuleSettingsField>

      {(settings.timeMode === "frame" || needsMarkerPosition) && (
        <ModuleSettingsField label="Frame">
          <ModuleNumberInput
            min={0}
            value={settings.frame || 0}
            onChange={(value) => update("frame", Math.max(0, Number(value) || 0))}
          />
        </ModuleSettingsField>
      )}

      {(action === "set" || action === "rename") && (
        <ModuleSettingsField label={action === "rename" ? "New name" : "Name"}>
          <ModuleTextInput
            value={action === "rename" ? settings.newName || "" : settings.name || ""}
            placeholder="Marker name..."
            onChange={(value) =>
              update(action === "rename" ? "newName" : "name", value)
            }
          />
        </ModuleSettingsField>
      )}

      {action === "set" && (
        <ModuleSettingsField label="Color">
          <ModuleSelect
            value={settings.color || "Green"}
            onChange={(value) => update("color", value)}
            options={COLOR_OPTIONS}
          />
        </ModuleSettingsField>
      )}

      {action === "move" && (
        <ModuleSettingsField label="Move to frame">
          <ModuleNumberInput
            min={0}
            value={settings.moveToFrame || 0}
            onChange={(value) =>
              update("moveToFrame", Math.max(0, Number(value) || 0))
            }
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Copies">
          <ModuleNumberInput
            min={1}
            value={settings.duplicateCount || 1}
            onChange={(value) =>
              update("duplicateCount", Math.max(1, Number(value) || 1))
            }
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default MarkerObjectUI;