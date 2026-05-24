import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "add", label: "Add" },
  { value: "duplicate", label: "Duplicate" },
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
];

const TRACK_TYPE_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

const FIND_BY_OPTIONS = [
  { value: "index", label: "Track Number" },
  { value: "name", label: "Track Name" },
];

function getTrackLetter(trackType) {
  return trackType === "audio" ? "A" : "V";
}

function getTrackColor(trackType) {
  return trackType === "audio" ? "#3f8cff" : "#55b86a";
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

function TrackObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "add";
  const findBy = settings.findBy || "index";
  const trackType = settings.trackType || "video";

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
    action === "rename" || action === "delete" || action === "duplicate";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Track Type">
        <ModuleSelect
          value={trackType}
          onChange={(value) => update("trackType", value)}
          options={TRACK_TYPE_OPTIONS}
        />
      </ModuleSettingsField>

      {action === "add" && (
        <>
          <ModuleSettingsField label="Create At Track">
            <TrackNumberInput
              trackType={trackType}
              value={settings.trackIndex || 1}
              onChange={(value) => update("trackIndex", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Track Name">
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
          <ModuleSettingsField label="Find Track By">
            <ModuleSelect
              value={findBy}
              onChange={(value) => update("findBy", value)}
              options={FIND_BY_OPTIONS}
            />
          </ModuleSettingsField>

          {findBy === "index" && (
            <ModuleSettingsField label="Source Track">
              <TrackNumberInput
                trackType={trackType}
                value={settings.trackIndex || 1}
                onChange={(value) => update("trackIndex", value)}
              />
            </ModuleSettingsField>
          )}

          {findBy === "name" && (
            <ModuleSettingsField label="Source Track Name">
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
        <ModuleSettingsField label="New Track Name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New track name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate To Track">
          <TrackNumberInput
            trackType={trackType}
            value={settings.duplicateToIndex || 1}
            onChange={(value) => update("duplicateToIndex", value)}
          />
        </ModuleSettingsField>
      )}
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

export default TrackObjectUI;