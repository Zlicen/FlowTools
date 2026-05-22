import TimelineObjectUI from "./TimelineObjectUI";

export default {
  id: "object-timeline",
  name: "Timeline",
  description: "Set, rename, duplicate, delete or render timelines.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      name: "",
      findMode: "current",

      newName: "",
      duplicateName: "",
    };
  },

  SettingsComponent: TimelineObjectUI,
};