import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "transform", label: "Transform" },
  { value: "crop", label: "Crop" },
  { value: "speed", label: "Speed" },
  { value: "opacity", label: "Opacity" },
  { value: "duplicate", label: "Duplicate" },
  { value: "delete", label: "Delete" },
  { value: "move", label: "Move" },
  { value: "color", label: "Color" },
];

const COLOR_OPTIONS = [
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
  { value: "Yellow", label: "Yellow" },
  { value: "Red", label: "Red" },
  { value: "Pink", label: "Pink" },
  { value: "Purple", label: "Purple" },
  { value: "Orange", label: "Orange" },
];

function VideoClipObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "transform";

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

      <ModuleSettingsField label="Find by">
        <ModuleSelect
          value="underPlayhead"
          onChange={() => {}}
          options={[{ value: "underPlayhead", label: "Under playhead" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Track">
        <ModuleNumberInput
          min={1}
          value={settings.trackIndex || 1}
          onChange={(value) =>
            update("trackIndex", Math.max(1, Number(value) || 1))
          }
        />
      </ModuleSettingsField>

      {action === "transform" && (
        <>
          <ModuleSettingsField label="Position X">
            <ModuleNumberInput value={settings.positionX || 0} onChange={(v) => update("positionX", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Position Y">
            <ModuleNumberInput value={settings.positionY || 0} onChange={(v) => update("positionY", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Zoom X">
            <ModuleNumberInput step={0.01} value={settings.zoomX || 1} onChange={(v) => update("zoomX", Number(v) || 1)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Zoom Y">
            <ModuleNumberInput step={0.01} value={settings.zoomY || 1} onChange={(v) => update("zoomY", Number(v) || 1)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Rotation">
            <ModuleNumberInput value={settings.rotationAngle || 0} onChange={(v) => update("rotationAngle", Number(v) || 0)} />
          </ModuleSettingsField>
        </>
      )}

      {action === "crop" && (
        <>
          <ModuleSettingsField label="Crop Left">
            <ModuleNumberInput value={settings.cropLeft || 0} onChange={(v) => update("cropLeft", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Right">
            <ModuleNumberInput value={settings.cropRight || 0} onChange={(v) => update("cropRight", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Top">
            <ModuleNumberInput value={settings.cropTop || 0} onChange={(v) => update("cropTop", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Bottom">
            <ModuleNumberInput value={settings.cropBottom || 0} onChange={(v) => update("cropBottom", Number(v) || 0)} />
          </ModuleSettingsField>

          <ModuleSettingsField label="Softness">
            <ModuleNumberInput value={settings.cropSoftness || 0} onChange={(v) => update("cropSoftness", Number(v) || 0)} />
          </ModuleSettingsField>
        </>
      )}

      {action === "speed" && (
        <ModuleSettingsField label="Speed %">
          <ModuleNumberInput
            min={1}
            value={settings.speed || 100}
            onChange={(value) => update("speed", Math.max(1, Number(value) || 100))}
          />
        </ModuleSettingsField>
      )}

      {action === "opacity" && (
        <ModuleSettingsField label="Opacity %">
          <ModuleNumberInput
            min={0}
            max={100}
            value={settings.opacity ?? 100}
            onChange={(value) =>
              update("opacity", Math.min(100, Math.max(0, Number(value) || 0)))
            }
          />
        </ModuleSettingsField>
      )}

      {(action === "duplicate" || action === "move") && (
        <>
          <ModuleSettingsField label={action === "duplicate" ? "Duplicate to track" : "Move to track"}>
            <ModuleNumberInput
              min={1}
              value={settings.targetTrackIndex || 1}
              onChange={(value) =>
                update("targetTrackIndex", Math.max(1, Number(value) || 1))
              }
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Offset frames">
            <ModuleNumberInput
              value={settings.offsetFrames || 0}
              onChange={(value) => update("offsetFrames", Number(value) || 0)}
            />
          </ModuleSettingsField>
        </>
      )}

      {action === "color" && (
        <ModuleSettingsField label="Color">
          <ModuleSelect
            value={settings.color || "Blue"}
            onChange={(value) => update("color", value)}
            options={COLOR_OPTIONS}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default VideoClipObjectUI;