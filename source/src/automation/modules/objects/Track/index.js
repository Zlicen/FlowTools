import TrackObjectUI from "./TrackObjectUI";

export default {
  id: "object-track",
  name: "Track",
  description: "Create, set, rename, delete, move or duplicate timeline tracks.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      trackType: "video",
      trackIndex: 1,
      name: "",
      color: "default",

      moveDirection: "up",
      moveAmount: 1,
      duplicateCount: 1,
    };
  },

  SettingsComponent: TrackObjectUI,
};