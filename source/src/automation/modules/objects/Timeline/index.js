import TimelineObjectUI from "./TimelineObjectUI";

export default {
  id: "object-timeline",
  name: "Timeline",
  description: "Duplicate, rename or delete timelines.",
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

  SettingsComponent: TimelineObjectUI,
};