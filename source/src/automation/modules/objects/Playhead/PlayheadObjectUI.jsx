import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
} from "../../../components";

const MOVE_TO_OPTIONS = [
  { value: "timecode", label: "Specific Timecode" },
  { value: "frame", label: "Specific Frame" },
  { value: "framesFromCurrent", label: "Offset From Current Position" },
  { value: "nextClip", label: "Next Clip" },
  { value: "previousClip", label: "Previous Clip" },
];

const TRACK_TYPE_OPTIONS = [
  { value: "any", label: "Any Track" },
  { value: "video", label: "Video Track" },
  { value: "audio", label: "Audio Track" },
];

const DIRECTION_OPTIONS = [
  { value: "forward", label: "Forward" },
  { value: "backward", label: "Backward" },
];

function clampNumber(value, min = 0, max = null) {
  const number = Number(value);
  const clean = Number.isFinite(number) ? number : min;
  const clampedMin = Math.max(min, clean);

  if (max === null) return clampedMin;

  return Math.min(max, clampedMin);
}

function pad2(value) {
  return String(clampNumber(value, 0)).padStart(2, "0");
}

function parseTimecode(timecode) {
  const parts = String(timecode || "00:00:00:00")
    .split(":")
    .map((part) => Number(part));

  return {
    hours: Number.isFinite(parts[0]) ? parts[0] : 0,
    minutes: Number.isFinite(parts[1]) ? parts[1] : 0,
    seconds: Number.isFinite(parts[2]) ? parts[2] : 0,
    frames: Number.isFinite(parts[3]) ? parts[3] : 0,
  };
}

function buildTimecode(parts) {
  return [
    pad2(parts.hours),
    pad2(clampNumber(parts.minutes, 0, 59)),
    pad2(clampNumber(parts.seconds, 0, 59)),
    pad2(parts.frames),
  ].join(":");
}

function getTrackLetter(trackType) {
  if (trackType === "audio") return "A";
  if (trackType === "video") return "V";
  return "";
}

function getTrackColor(trackType) {
  if (trackType === "audio") return "#3f8cff";
  if (trackType === "video") return "#55b86a";
  return "#777";
}

function TrackNumberInput({ trackType, value, onChange }) {
  const letter = getTrackLetter(trackType);
  const color = getTrackColor(trackType);

  return (
    <div style={styles.trackInputRow}>
      <div
        style={{
          ...styles.trackPrefix,
          borderColor: color,
          color,
        }}
      >
        {letter}
      </div>

      <div style={styles.trackNumberInput}>
        <ModuleNumberInput
          min={1}
          value={value || 1}
          onChange={(nextValue) =>
            onChange(Math.max(1, Number(nextValue) || 1))
          }
        />
      </div>
    </div>
  );
}

function TimecodeSmallInput({ label, value, max, onChange }) {
  return (
    <div style={styles.timecodePart}>
      <span style={styles.timecodeLabel}>{label}</span>

      <input
        type="number"
        min={0}
        max={max ?? undefined}
        value={value}
        onChange={(event) => {
          const nextValue = clampNumber(
            event.target.value,
            0,
            max ?? null
          );

          onChange(nextValue);
        }}
        style={styles.timecodeInput}
      />
    </div>
  );
}

function TimecodeInput({ value, onChange }) {
  const current = parseTimecode(value);

  function updatePart(key, nextValue) {
    const next = {
      ...current,
      [key]: nextValue,
    };

    onChange(buildTimecode(next));
  }

  return (
    <div style={styles.timecodeWrap}>
      <TimecodeSmallInput
        label="HH"
        value={current.hours}
        onChange={(value) => updatePart("hours", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="MM"
        value={current.minutes}
        max={59}
        onChange={(value) => updatePart("minutes", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="SS"
        value={current.seconds}
        max={59}
        onChange={(value) => updatePart("seconds", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="FF"
        value={current.frames}
        onChange={(value) => updatePart("frames", value)}
      />
    </div>
  );
}

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

  const usesClipTarget = moveTo === "nextClip" || moveTo === "previousClip";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={settings.action || "move"}
          onChange={(value) => update("action", value)}
          options={[{ value: "move", label: "Move Playhead" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Move Playhead To">
        <ModuleSelect
          value={moveTo}
          onChange={(value) => update("moveTo", value)}
          options={MOVE_TO_OPTIONS}
        />
      </ModuleSettingsField>

      {moveTo === "timecode" && (
        <ModuleSettingsField label="Target Timecode">
          <TimecodeInput
            value={settings.timecode || "00:00:00:00"}
            onChange={(value) => update("timecode", value)}
          />
        </ModuleSettingsField>
      )}

      {moveTo === "frame" && (
        <ModuleSettingsField label="Target Frame">
          <ModuleNumberInput
            min={0}
            value={settings.frame || 0}
            onChange={(value) =>
              update("frame", Math.max(0, Number(value) || 0))
            }
          />
        </ModuleSettingsField>
      )}

      {moveTo === "framesFromCurrent" && (
        <>
          <ModuleSettingsField label="Move Direction">
            <ModuleSelect
              value={settings.direction || "forward"}
              onChange={(value) => update("direction", value)}
              options={DIRECTION_OPTIONS}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Frame Offset">
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
          <ModuleSettingsField label="Search Track Type">
            <ModuleSelect
              value={trackType}
              onChange={(value) => update("trackType", value)}
              options={TRACK_TYPE_OPTIONS}
            />
          </ModuleSettingsField>

          {trackType !== "any" && (
            <ModuleSettingsField label="Search Track">
              <TrackNumberInput
                trackType={trackType}
                value={settings.trackIndex || 1}
                onChange={(value) => update("trackIndex", value)}
              />
            </ModuleSettingsField>
          )}
        </>
      )}
    </ModuleSettingsBox>
  );
}

const styles = {
  timecodeWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
    width: "100%",
    minWidth: 0,
  },

  timecodePart: {
    width: 48,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  timecodeLabel: {
    fontSize: 9,
    opacity: 0.6,
    fontWeight: 700,
    lineHeight: 1,
  },

  timecodeInput: {
    width: "100%",
    height: 32,
    boxSizing: "border-box",
    background: "#101010",
    color: "white",
    border: "1px solid #333",
    borderRadius: 7,
    padding: "0 5px",
    fontSize: 12,
    fontWeight: 600,
    outline: "none",
  },

  timecodeSeparator: {
    paddingBottom: 8,
    opacity: 0.55,
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
  },

  trackInputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },

  trackPrefix: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#101010",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },

  trackNumberInput: {
    flex: 1,
    minWidth: 0,
  },
};

export default PlayheadObjectUI;