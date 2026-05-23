import TrackObjectUI from "./TrackObjectUI";

export default {
  id: "object-track",
  name: "Track",
  description: "Add, rename, delete or duplicate tracks.",
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

  SettingsComponent: TrackObjectUI,
};