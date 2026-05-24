import MarkerObjectUI from "./MarkerObjectUI";

export default {
  id: "object-marker",

  name: "Marker",

  description:
    "Manage and automate markers on the current timeline",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "add",

      position: "currentPlayhead",
      frame: 0,
      timecode: "",

      name: "",
      markerName: "",

      color: "Blue",
      newColor: "Blue",

      note: "",
      newNote: "",

      newName: "",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.action === "add" &&
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing marker name");
    }

    if (
      settings.action === "rename" &&
      !String(settings.newName || "").trim()
    ) {
      warnings.push("Missing new marker name");
    }

    if (
      (
        settings.action === "rename" ||
        settings.action === "duplicate" ||
        settings.action === "delete" ||
        settings.action === "color" ||
        settings.action === "note"
      ) &&
      !String(settings.markerName || "").trim()
    ) {
      warnings.push("Missing source marker");
    }

    if (
      settings.position === "timecode" &&
      !String(settings.timecode || "").trim()
    ) {
      warnings.push("Missing timecode");
    }

    return warnings;
  },

  SettingsComponent: MarkerObjectUI,
};