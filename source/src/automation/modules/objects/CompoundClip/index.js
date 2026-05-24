import CompoundClipObjectUI from "./CompoundClipObjectUI";

export default {
  id: "object-compound-clip",

  name: "Compound Clip",

  description:
    "Create compound clips from clips under the playhead",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "create",

      findBy: "underPlayhead",

      sourceMode: "both",

      videoTracks: "1",
      audioTracks: "1",

      name: "Compound Clip",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.sourceMode !== "audio" &&
      !String(settings.videoTracks || "").trim()
    ) {
      warnings.push("Missing video track");
    }

    if (
      settings.sourceMode !== "video" &&
      !String(settings.audioTracks || "").trim()
    ) {
      warnings.push("Missing audio track");
    }

    if (
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing compound clip name");
    }

    return warnings;
  },

  SettingsComponent: CompoundClipObjectUI,
};