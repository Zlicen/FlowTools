import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const SOURCE_MODE_OPTIONS = [
  { value: "both", label: "Video + Audio" },
  { value: "video", label: "Video Only" },
  { value: "audio", label: "Audio Only" },
];

function cleanTrackList(value) {
  return String(value ?? "1")
    .split(",")
    .map((part) => Math.max(1, Number(part.trim()) || 1))
    .join(",");
}

function parseFirstTrack(value, fallback = 1) {
  const first = String(value ?? "")
    .split(",")[0];

  const number = Number(first);

  return Number.isFinite(number) && number >= 1 ? number : fallback;
}

function updateFirstTrack(currentValue, nextTrack) {
  const parts = String(currentValue ?? "1")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return String(Math.max(1, Number(nextTrack) || 1));
  }

  parts[0] = String(Math.max(1, Number(nextTrack) || 1));

  return parts.join(",");
}

function TrackNumberInput({ type, value, onChange }) {
  const isAudio = type === "audio";

  return (
    <div style={styles.trackInputRow}>
      <div
        style={{
          ...styles.trackPrefix,
          borderColor: isAudio ? "#3f8cff" : "#55b86a",
          color: isAudio ? "#3f8cff" : "#55b86a",
        }}
      >
        {isAudio ? "A" : "V"}
      </div>

      <div style={styles.trackNumberInput}>
        <ModuleNumberInput
          min={1}
          value={parseFirstTrack(value, 1)}
          onChange={(nextValue) => onChange(updateFirstTrack(value, nextValue))}
        />
      </div>
    </div>
  );
}

function CompoundClipObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const sourceMode = settings.sourceMode || "both";

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
          value="create"
          onChange={() => {}}
          options={[{ value: "create", label: "Create Compound Clip" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Find Clips">
        <ModuleSelect
          value="underPlayhead"
          onChange={() => {}}
          options={[{ value: "underPlayhead", label: "Under Playhead" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Create From">
        <ModuleSelect
          value={sourceMode}
          onChange={(value) => update("sourceMode", value)}
          options={SOURCE_MODE_OPTIONS}
        />
      </ModuleSettingsField>

      {(sourceMode === "both" || sourceMode === "video") && (
        <ModuleSettingsField label="Video Track">
          <TrackNumberInput
            type="video"
            value={settings.videoTracks ?? "1"}
            onChange={(value) => update("videoTracks", cleanTrackList(value))}
          />
        </ModuleSettingsField>
      )}

      {(sourceMode === "both" || sourceMode === "audio") && (
        <ModuleSettingsField label="Audio Track">
          <TrackNumberInput
            type="audio"
            value={settings.audioTracks ?? "1"}
            onChange={(value) => update("audioTracks", cleanTrackList(value))}
          />
        </ModuleSettingsField>
      )}

      <ModuleSettingsField label="Compound Clip Name">
        <ModuleTextInput
          value={settings.name ?? "Compound Clip"}
          placeholder="Compound Clip"
          onChange={(value) => update("name", value)}
        />
      </ModuleSettingsField>
    </ModuleSettingsBox>
  );
}

const styles = {
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

export default CompoundClipObjectUI;