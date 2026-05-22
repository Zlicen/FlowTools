import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

function PlayheadObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};

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
          value={settings.action || "move"}
          onChange={(value) => update("action", value)}
          options={[
            { value: "move", label: "Move" },
          ]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Move to">
        <ModuleSelect
          value={settings.moveMode || "timecode"}
          onChange={(value) => update("moveMode", value)}
          options={[
            { value: "timecode", label: "Timecode" },
            { value: "frame", label: "Frame" },
          ]}
        />
      </ModuleSettingsField>

      {settings.moveMode === "timecode" && (
        <ModuleSettingsField label="Timecode">
          <ModuleTextInput
            value={settings.timecode || ""}
            placeholder="Example: 01:00:10:12"
            onChange={(value) => update("timecode", value)}
          />
        </ModuleSettingsField>
      )}

      {settings.moveMode === "frame" && (
        <ModuleSettingsField label="Frame">
          <ModuleNumberInput
            min={0}
            value={settings.frame || 0}
            onChange={(value) => update("frame", Math.max(0, Number(value) || 0))}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default PlayheadObjectUI;