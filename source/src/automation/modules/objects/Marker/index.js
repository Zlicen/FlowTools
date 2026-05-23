import MarkerObjectUI from "./MarkerObjectUI";

export default {
  id: "object-marker",
  name: "Marker",
  description: "Add, move, duplicate, rename, delete, color or note markers.",
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

  SettingsComponent: MarkerObjectUI,
};