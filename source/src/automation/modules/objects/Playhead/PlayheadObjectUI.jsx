import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const MOVE_TO_OPTIONS = [
  { value: "timecode", label: "Timecode" },
  { value: "frame", label: "Frame" },
  { value: "framesFromCurrent", label: "Frames from current position" },
  { value: "nextClip", label: "Next clip" },
  { value: "previousClip", label: "Previous clip" },
];

const TRACK_TYPE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

function PlayheadObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const moveTo = settings.moveTo || "timecode";
  const trackType = settings.trackType || "any";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  const usesClipTarget =
    moveTo === "nextClip" ||
    moveTo === "previousClip";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={settings.action || "move"}
          onChange={(value) => update("action", value)}
          options={[{ value: "move", label: "Move" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Move to">
        <ModuleSelect
          value={moveTo}
          onChange={(value) => update("moveTo", value)}
          options={MOVE_TO_OPTIONS}
        />
      </ModuleSettingsField>

      {moveTo === "timecode" && (
        <ModuleSettingsField label="Timecode">
          <ModuleTextInput
            value={settings.timecode || ""}
            placeholder="Example: 00:01:25:10"
            onChange={(value) => update("timecode", value)}
          />
        </ModuleSettingsField>
      )}

      {moveTo === "frame" && (
        <ModuleSettingsField label="Frame">
          <ModuleNumberInput
            min={0}
            value={settings.frame || 0}
            onChange={(value) => update("frame", Math.max(0, Number(value) || 0))}
          />
        </ModuleSettingsField>
      )}

      {moveTo === "framesFromCurrent" && (
  <>
    <ModuleSettingsField label="Direction">
      <ModuleSelect
        value={settings.direction || "forward"}
        onChange={(value) => update("direction", value)}
        options={[
          { value: "forward", label: "Forward" },
          { value: "backward", label: "Backward" },
        ]}
      />
    </ModuleSettingsField>

    <ModuleSettingsField label="Frames">
      <ModuleNumberInput
        min={1}
        value={settings.frames || 1}
        onChange={(value) =>
          update("frames", Math.max(1, Number(value) || 1))
        }
      />
    </ModuleSettingsField>
  </>
)}

      {usesClipTarget && (
        <>
          <ModuleSettingsField label="Track type">
            <ModuleSelect
              value={trackType}
              onChange={(value) => update("trackType", value)}
              options={TRACK_TYPE_OPTIONS}
            />
          </ModuleSettingsField>

          {trackType !== "any" && (
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
        </>
      )}
    </ModuleSettingsBox>
  );
}

export default PlayheadObjectUI;