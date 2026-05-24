import {
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "duplicate", label: "Duplicate" },
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
];

const FIND_BY_OPTIONS = [
  { value: "current", label: "Current Timeline" },
  { value: "name", label: "Timeline Name" },
];

function TimelineObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "duplicate";
  const findBy = settings.findBy || "current";

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

      <ModuleSettingsField label="Find Timeline By">
        <ModuleSelect
          value={findBy}
          onChange={(value) => update("findBy", value)}
          options={FIND_BY_OPTIONS}
        />
      </ModuleSettingsField>

      {findBy === "name" && (
        <ModuleSettingsField label="Source Timeline">
          <ModuleTextInput
            value={settings.timelineName || ""}
            placeholder="Existing timeline name..."
            onChange={(value) => update("timelineName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate As">
          <ModuleTextInput
            value={settings.name || ""}
            placeholder="New timeline name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New Timeline Name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New timeline name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

    </ModuleSettingsBox>
  );
}

export default TimelineObjectUI;