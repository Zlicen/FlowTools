import TrackObjectUI from "./TrackObjectUI";

export default {
  id: "object-track",

  name: "Track",

  description:
    "Manage and automate tracks on the current timeline",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "add",

      trackType: "video",
      trackIndex: 1,

      findBy: "index",
      trackName: "",

      name: "",
      newName: "",

      duplicateToIndex: 1,
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.findBy === "name" &&
      !String(settings.trackName || "").trim()
    ) {
      warnings.push("Missing source track");
    }

    if (
      settings.findBy === "index" &&
      (
        settings.trackIndex === undefined ||
        settings.trackIndex < 1
      )
    ) {
      warnings.push("Missing source track");
    }

    if (
      settings.action === "add" &&
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing track name");
    }

    if (
      settings.action === "rename" &&
      !String(settings.newName || "").trim()
    ) {
      warnings.push("Missing new track name");
    }

    if (
      settings.action === "duplicate" &&
      (
        settings.duplicateToIndex === undefined ||
        settings.duplicateToIndex < 1
      )
    ) {
      warnings.push("Missing destination track");
    }

    return warnings;
  },

  SettingsComponent: TrackObjectUI,
};