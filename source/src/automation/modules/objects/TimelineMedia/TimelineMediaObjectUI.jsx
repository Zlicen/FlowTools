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

function TimelineMediaObjectUI({ module, onUpdate }) {
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
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Item type">
        <ModuleSelect
          value={settings.itemType || "any"}
          onChange={(value) => update("itemType", value)}
          options={[
            { value: "any", label: "Any" },
            { value: "video", label: "Video" },
            { value: "audio", label: "Audio" },
            { value: "subtitle", label: "Subtitle" },
          ]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Find item">
        <ModuleSelect
          value={settings.findMode || "playhead"}
          onChange={(value) => update("findMode", value)}
          options={[
            { value: "playhead", label: "Under playhead" },
            { value: "track", label: "On track" },
            { value: "name", label: "By name" },
          ]}
        />
      </ModuleSettingsField>

      {settings.findMode === "track" && (
        <>
          <ModuleSettingsField label="Track type">
            <ModuleSelect
              value={settings.trackType || "video"}
              onChange={(value) => update("trackType", value)}
              options={TRACK_TYPE_OPTIONS}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Track index">
            <ModuleNumberInput
              min={1}
              value={settings.trackIndex || 1}
              onChange={(value) =>
                update("trackIndex", Math.max(1, Number(value) || 1))
              }
            />
          </ModuleSettingsField>
        </>
      )}

      {settings.findMode === "name" && (
        <ModuleSettingsField label="Item name">
          <ModuleTextInput
            value={settings.name || ""}
            placeholder="Timeline item name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New item name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "move" && (
        <>
          <ModuleSettingsField label="Move to track type">
            <ModuleSelect
              value={settings.moveToTrackType || "video"}
              onChange={(value) => update("moveToTrackType", value)}
              options={TRACK_TYPE_OPTIONS}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Move to track index">
            <ModuleNumberInput
              min={1}
              value={settings.moveToTrackIndex || 1}
              onChange={(value) =>
                update("moveToTrackIndex", Math.max(1, Number(value) || 1))
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

export default TimelineMediaObjectUI;