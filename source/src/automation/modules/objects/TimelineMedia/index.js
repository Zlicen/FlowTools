import TimelineMediaObjectUI from "./TimelineMediaObjectUI";

export default {
  id: "object-timeline-media",
  name: "Timeline Items",
  description: "Set, delete, rename, move or duplicate items on the timeline.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      itemType: "any",
      findMode: "playhead",
      trackType: "video",
      trackIndex: 1,
      name: "",

      newName: "",
      moveToTrackType: "video",
      moveToTrackIndex: 1,
      duplicateCount: 1,
    };
  },

  SettingsComponent: TimelineMediaObjectUI,
};