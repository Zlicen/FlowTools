import AudioClipObjectUI from "./AudioClipObjectUI";

export default {
  id: "object-audio-clip",
  name: "Audio Clip",
  description: "Duplicate, delete or color audio clips.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "duplicate",
      trackIndex: 1,
      duplicateToTrackIndex: 2,
      color: "Blue",
    };
  },

  SettingsComponent: AudioClipObjectUI,
};