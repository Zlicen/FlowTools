import AudioClipObjectUI from "./AudioClipObjectUI";

export default {
  id: "object-audio-clip",

  name: "Audio Clip",

  description:
    "Manage and automate audio clips on the current timeline",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "duplicate",

      trackIndex: 1,

      duplicateToTrackIndex: 2,

      name: "Audio Clip",

      color: "Blue",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.trackIndex === undefined ||
      settings.trackIndex < 1
    ) {
      warnings.push("Missing source track");
    }

    if (
      settings.action === "rename" &&
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing new clip name");
    }

    if (
      settings.action === "duplicate" &&
      (
        settings.duplicateToTrackIndex === undefined ||
        settings.duplicateToTrackIndex < 1
      )
    ) {
      warnings.push("Missing destination track");
    }

    return warnings;
  },

  SettingsComponent: AudioClipObjectUI,
};