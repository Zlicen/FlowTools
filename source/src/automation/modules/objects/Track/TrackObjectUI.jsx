import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "add", label: "Add" },
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
  { value: "duplicate", label: "Duplicate" },
];

const TRACK_TYPE_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

const FIND_BY_OPTIONS = [
  { value: "index", label: "Index" },
  { value: "name", label: "Name" },
];

function TrackObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "add";
  const findBy = settings.findBy || "index";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  const needsFindBy =
    action === "rename" ||
    action === "delete" ||
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

      {action === "add" && (
        <>
          <ModuleSettingsField label="Track index">
            <ModuleNumberInput
              min={1}
              value={settings.trackIndex || 1}
              onChange={(value) =>
                update("trackIndex", Math.max(1, Number(value) || 1))
              }
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Name">
            <ModuleTextInput
              value={settings.name || ""}
              placeholder="Track name..."
              onChange={(value) => update("name", value)}
            />
          </ModuleSettingsField>
        </>
      )}

      {needsFindBy && (
        <>
          <ModuleSettingsField label="Find by">
            <ModuleSelect
              value={findBy}
              onChange={(value) => update("findBy", value)}
              options={FIND_BY_OPTIONS}
            />
          </ModuleSettingsField>

          {findBy === "index" && (
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

          {findBy === "name" && (
            <ModuleSettingsField label="Track name">
              <ModuleTextInput
                value={settings.trackName || ""}
                placeholder="Existing track name..."
                onChange={(value) => update("trackName", value)}
              />
            </ModuleSettingsField>
          )}
        </>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New track name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate to index">
          <ModuleNumberInput
            min={1}
            value={settings.duplicateToIndex || 1}
            onChange={(value) =>
              update("duplicateToIndex", Math.max(1, Number(value) || 1))
            }
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default TrackObjectUI;