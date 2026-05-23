import PlayheadObjectUI from "./PlayheadObjectUI";

export default {
  id: "object-playhead",
  name: "Playhead",
  description: "Move the timeline playhead.",
  categoryId: "objects",
  categoryName: "Objects",
  direction: "forward",
  frames: 1,

  createDefaultSettings() {
    return {
      action: "move",

      moveTo: "timecode",
      timecode: "",
      frame: 0,

      trackType: "any",
      trackIndex: 1,
    };
  },

  SettingsComponent: PlayheadObjectUI,
};