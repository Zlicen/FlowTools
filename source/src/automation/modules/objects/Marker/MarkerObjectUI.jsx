import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "add", label: "Add" },
  { value: "duplicate", label: "Duplicate" },
];

const POSITION_OPTIONS = [
  { value: "currentPlayhead", label: "Current playhead" },
  { value: "frame", label: "Frame" },
  { value: "timecode", label: "Timecode" },
];

const COLOR_OPTIONS = [
  { value: "Blue", label: "Blue" },
  { value: "Cyan", label: "Cyan" },
  { value: "Green", label: "Green" },
  { value: "Yellow", label: "Yellow" },
  { value: "Red", label: "Red" },
  { value: "Pink", label: "Pink" },
  { value: "Purple", label: "Purple" },
  { value: "Fuchsia", label: "Fuchsia" },
  { value: "Rose", label: "Rose" },
  { value: "Lavender", label: "Lavender" },
  { value: "Sky", label: "Sky" },
  { value: "Mint", label: "Mint" },
  { value: "Lemon", label: "Lemon" },
  { value: "Sand", label: "Sand" },
  { value: "Cocoa", label: "Cocoa" },
  { value: "Cream", label: "Cream" },
];

function MarkerObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "add";
  const position = settings.position || "currentPlayhead";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  const needsFindByName =
    action === "move" ||
    action === "duplicate" ||
    action === "rename" ||
    action === "delete" ||
    action === "color" ||
    action === "note";

  const needsPosition =
    action === "add" ||
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

      {needsFindByName && (
        <ModuleSettingsField label="Find by name">
          <ModuleTextInput
            value={settings.markerName || ""}
            placeholder="Existing marker name..."
            onChange={(value) => update("markerName", value)}
          />
        </ModuleSettingsField>
      )}

      {needsPosition && (
        <>
          <ModuleSettingsField
            label={
              action === "add"
                ? "Position"
                : action === "move"
                  ? "Move to"
                  : "Duplicate to"
            }
          >
            <ModuleSelect
              value={position}
              onChange={(value) => update("position", value)}
              options={POSITION_OPTIONS}
            />
          </ModuleSettingsField>

          {position === "frame" && (
            <ModuleSettingsField label="Frame">
              <ModuleNumberInput
                min={0}
                value={settings.frame || 0}
                onChange={(value) =>
                  update("frame", Math.max(0, Number(value) || 0))
                }
              />
            </ModuleSettingsField>
          )}

          {position === "timecode" && (
            <ModuleSettingsField label="Timecode">
              <ModuleTextInput
                value={settings.timecode || ""}
                placeholder="Example: 00:01:25:10"
                onChange={(value) => update("timecode", value)}
              />
            </ModuleSettingsField>
          )}
        </>
      )}

      {action === "add" && (
        <>
          <ModuleSettingsField label="Name">
            <ModuleTextInput
              value={settings.name || ""}
              placeholder="Marker name..."
              onChange={(value) => update("name", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Color">
            <ModuleSelect
              value={settings.color || "Blue"}
              onChange={(value) => update("color", value)}
              options={COLOR_OPTIONS}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Note">
            <ModuleTextInput
              value={settings.note || ""}
              placeholder="Marker note..."
              onChange={(value) => update("note", value)}
            />
          </ModuleSettingsField>
        </>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New marker name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "color" && (
        <ModuleSettingsField label="New color">
          <ModuleSelect
            value={settings.newColor || "Blue"}
            onChange={(value) => update("newColor", value)}
            options={COLOR_OPTIONS}
          />
        </ModuleSettingsField>
      )}

      {action === "note" && (
        <ModuleSettingsField label="New note">
          <ModuleTextInput
            value={settings.newNote || ""}
            placeholder="New marker note..."
            onChange={(value) => update("newNote", value)}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default MarkerObjectUI;