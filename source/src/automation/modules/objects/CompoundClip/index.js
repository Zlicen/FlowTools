import CompoundClipObjectUI from "./CompoundClipObjectUI";

export default {
  id: "object-compound-clip",
  name: "Compound Clip",
  description: "Create, rename or delete compound clips from clips under the playhead.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "create",

      findBy: "underPlayhead",

      sourceMode: "both",
      videoTracks: "1",
      audioTracks: "1",

      name: "Compound Clip",
    };
  },

  SettingsComponent: CompoundClipObjectUI,
};