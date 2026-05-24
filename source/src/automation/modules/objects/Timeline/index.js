import TimelineObjectUI from "./TimelineObjectUI";

export default {
  id: "object-timeline",

  name: "Timeline",

  description:
    "Manage and automate timelines",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "duplicate",

      findBy: "current",
      timelineName: "",

      name: "",
      newName: "",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.findBy === "name" &&
      !String(settings.timelineName || "").trim()
    ) {
      warnings.push("Missing source timeline");
    }

    if (
      settings.action === "duplicate" &&
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing new timeline name");
    }

    if (
      settings.action === "rename" &&
      !String(settings.newName || "").trim()
    ) {
      warnings.push("Missing new timeline name");
    }

    return warnings;
  },

  SettingsComponent: TimelineObjectUI,
};