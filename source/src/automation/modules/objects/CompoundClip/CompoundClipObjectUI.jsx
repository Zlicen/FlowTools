import {
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "create", label: "Create" },
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
];

const CREATE_SOURCE_MODE_OPTIONS = [
  { value: "both", label: "Video + Audio" },
  { value: "video", label: "Only Video" },
  { value: "audio", label: "Only Audio" },
];

const SINGLE_SOURCE_MODE_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

function CompoundClipObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "create";

  const sourceMode =
    action === "create"
      ? settings.sourceMode || "both"
      : settings.sourceMode === "audio"
        ? "audio"
        : "video";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  function updateAction(nextAction) {
    const nextSettings = {
      ...settings,
      action: nextAction,
    };

    if (nextAction === "create") {
      nextSettings.sourceMode = settings.sourceMode || "both";
    } else {
      nextSettings.sourceMode =
        settings.sourceMode === "audio" ? "audio" : "video";
    }

    onUpdate({
      ...module,
      settings: nextSettings,
    });
  }

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={updateAction}
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

      <ModuleSettingsField label="Source">
        <ModuleSelect
          value={sourceMode}
          onChange={(value) => update("sourceMode", value)}
          options={
            action === "create"
              ? CREATE_SOURCE_MODE_OPTIONS
              : SINGLE_SOURCE_MODE_OPTIONS
          }
        />
      </ModuleSettingsField>

      {action === "create" && (sourceMode === "both" || sourceMode === "video") && (
        <ModuleSettingsField label="Video Tracks">
          <ModuleTextInput
            value={settings.videoTracks ?? "1"}
            placeholder="Example: 1 or 1,2,3"
            onChange={(value) => update("videoTracks", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "create" && (sourceMode === "both" || sourceMode === "audio") && (
        <ModuleSettingsField label="Audio Tracks">
          <ModuleTextInput
            value={settings.audioTracks ?? "1"}
            placeholder="Example: 1 or 1,2,3"
            onChange={(value) => update("audioTracks", value)}
          />
        </ModuleSettingsField>
      )}

      {action !== "create" && (
        <ModuleSettingsField label="Track">
          <ModuleTextInput
            value={
              sourceMode === "audio"
                ? settings.audioTracks ?? "1"
                : settings.videoTracks ?? "1"
            }
            placeholder="Example: 1"
            onChange={(value) =>
              update(sourceMode === "audio" ? "audioTracks" : "videoTracks", value)
            }
          />
        </ModuleSettingsField>
      )}

      {(action === "create" || action === "rename") && (
        <ModuleSettingsField label="Name">
          <ModuleTextInput
            value={settings.name ?? "Compound Clip"}
            placeholder="Compound Clip"
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

export default CompoundClipObjectUI;