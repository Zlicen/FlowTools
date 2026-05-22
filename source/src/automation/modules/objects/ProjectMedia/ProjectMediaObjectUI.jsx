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

const MEDIA_TYPE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Image" },
];

function ProjectMediaObjectUI({ module, onUpdate }) {
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

  const needsExistingItem =
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

      <ModuleSettingsField label="Media type">
        <ModuleSelect
          value={settings.mediaType || "any"}
          onChange={(value) => update("mediaType", value)}
          options={MEDIA_TYPE_OPTIONS}
        />
      </ModuleSettingsField>

      {action === "set" && (
        <>
          <ModuleSettingsField label="Source path">
            <ModuleTextInput
              value={settings.sourcePath || ""}
              placeholder="File or folder path..."
              onChange={(value) => update("sourcePath", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Destination bin">
            <ModuleSelect
              value={settings.binMode || "current"}
              onChange={(value) => update("binMode", value)}
              options={[
                { value: "current", label: "Current bin" },
                { value: "path", label: "Bin path" },
              ]}
            />
          </ModuleSettingsField>

          {settings.binMode === "path" && (
            <ModuleSettingsField label="Bin path">
              <ModuleTextInput
                value={settings.binPath || ""}
                placeholder="Example: Media/SFX"
                onChange={(value) => update("binPath", value)}
              />
            </ModuleSettingsField>
          )}
        </>
      )}

      {needsExistingItem && (
        <>
          <ModuleSettingsField label="Find item">
            <ModuleSelect
              value={settings.findMode || "name"}
              onChange={(value) => update("findMode", value)}
              options={[
                { value: "name", label: "By name" },
                { value: "currentBin", label: "Current bin" },
              ]}
            />
          </ModuleSettingsField>

          {settings.findMode === "name" && (
            <ModuleSettingsField label="Item name">
              <ModuleTextInput
                value={settings.name || ""}
                placeholder="Media Pool item name..."
                onChange={(value) => update("name", value)}
              />
            </ModuleSettingsField>
          )}
        </>
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
        <ModuleSettingsField label="Move to bin path">
          <ModuleTextInput
            value={settings.moveToBinPath || ""}
            placeholder="Example: Media/Archive"
            onChange={(value) => update("moveToBinPath", value)}
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

export default ProjectMediaObjectUI;