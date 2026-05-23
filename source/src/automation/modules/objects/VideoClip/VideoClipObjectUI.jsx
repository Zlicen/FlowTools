import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "position", label: "Transform Position" },
  { value: "zoom", label: "Zoom" },
  { value: "rotation", label: "Rotation" },
  { value: "crop", label: "Crop" },
  { value: "opacity", label: "Opacity" },
  { value: "duplicate", label: "Duplicate" },
  { value: "delete", label: "Delete" },
  { value: "color", label: "Color" },
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

export default function VideoClipObjectUI({
  module,
  onUpdate,
}) {
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
          value={settings.action}
          options={ACTION_OPTIONS}
          onChange={(v)=>update("action",v)}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Video Track">
        <ModuleNumberInput
          value={settings.trackIndex}
          min={1}
          onChange={(v)=>update("trackIndex",Number(v))}
        />
      </ModuleSettingsField>

      {settings.action==="zoom" && (
        <ModuleSettingsField label="Zoom">
          <ModuleNumberInput
            value={settings.zoom}
            step={0.1}
            onChange={(v)=>update("zoom",Number(v))}
          />
        </ModuleSettingsField>
      )}

      {settings.action==="position" && (
        <>
          <ModuleSettingsField label="Position X">
            <ModuleNumberInput
              value={settings.positionX}
              onChange={(v)=>update("positionX",Number(v))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Position Y">
            <ModuleNumberInput
              value={settings.positionY}
              onChange={(v)=>update("positionY",Number(v))}
            />
          </ModuleSettingsField>
        </>
      )}

      {settings.action==="rotation" && (
        <ModuleSettingsField label="Rotation">
          <ModuleNumberInput
            value={settings.rotationAngle}
            onChange={(v)=>update("rotationAngle",Number(v))}
          />
        </ModuleSettingsField>
      )}

      {settings.action==="duplicate" && (
        <ModuleSettingsField label="Duplicate To Track">
          <ModuleNumberInput
            value={settings.duplicateToTrackIndex}
            min={1}
            onChange={(v)=>update("duplicateToTrackIndex",Number(v))}
          />
        </ModuleSettingsField>
      )}

      {settings.action==="opacity" && (
        <ModuleSettingsField label="Opacity">
          <ModuleNumberInput
            value={settings.opacity}
            min={0}
            max={100}
            onChange={(v)=>update("opacity",Number(v))}
          />
        </ModuleSettingsField>
      )}

      {settings.action==="color" && (
        <ModuleSettingsField label="Color">
          <ModuleSelect
            value={settings.color}
            options={COLOR_OPTIONS}
            onChange={(v)=>update("color",v)}
          />
        </ModuleSettingsField>
      )}

    </ModuleSettingsBox>
  );
}