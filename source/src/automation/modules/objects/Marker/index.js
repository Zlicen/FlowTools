import MarkerObjectUI from "./MarkerObjectUI";

export default {
  id: "object-marker",
  name: "Marker",
  description: "Create, set, rename, delete, move or duplicate timeline markers.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      name: "",
      color: "Green",
      frame: 0,
      timeMode: "playhead",

      newName: "",
      moveToFrame: 0,
      duplicateCount: 1,
    };
  },

  SettingsComponent: MarkerObjectUI,
};