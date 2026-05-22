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

const TRACK_TYPE_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "subtitle", label: "Subtitle" },
];

const COLOR_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
];

function TrackObjectUI({ module, onUpdate }) {
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

  const needsExistingTrack =
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

      <ModuleSettingsField label="Track type">
        <ModuleSelect
          value={settings.trackType || "video"}
          onChange={(value) => update("trackType", value)}
          options={TRACK_TYPE_OPTIONS}
        />
      </ModuleSettingsField>

      {needsExistingTrack && (
        <ModuleSettingsField label="Track index">
          <ModuleNumberInput
            min={1}
            value={settings.trackIndex || 1}
            onChange={(value) =>
              update("trackIndex", Math.max(1, Number(value) || 1))
            }
          />
        </ModuleSettingsField>
      )}

      {(action === "set" || action === "rename") && (
        <ModuleSettingsField label={action === "rename" ? "New name" : "Name"}>
          <ModuleTextInput
            value={settings.name || ""}
            placeholder="Track name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "set" && (
        <ModuleSettingsField label="Color">
          <ModuleSelect
            value={settings.color || "default"}
            onChange={(value) => update("color", value)}
            options={COLOR_OPTIONS}
          />
        </ModuleSettingsField>
      )}

      {action === "move" && (
        <>
          <ModuleSettingsField label="Direction">
            <ModuleSelect
              value={settings.moveDirection || "up"}
              onChange={(value) => update("moveDirection", value)}
              options={[
                { value: "up", label: "Up" },
                { value: "down", label: "Down" },
              ]}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Amount">
            <ModuleNumberInput
              min={1}
              value={settings.moveAmount || 1}
              onChange={(value) =>
                update("moveAmount", Math.max(1, Number(value) || 1))
              }
            />
          </ModuleSettingsField>
        </>
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

export default TrackObjectUI;