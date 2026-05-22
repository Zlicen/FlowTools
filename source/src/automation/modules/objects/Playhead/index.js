import PlayheadObjectUI from "./PlayheadObjectUI";

export default {
  id: "object-playhead",
  name: "Playhead",
  description: "Move the timeline playhead.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "move",

      moveMode: "timecode",
      timecode: "",
      frame: 0,
    };
  },

  SettingsComponent: PlayheadObjectUI,
};