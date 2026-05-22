import ProjectMediaObjectUI from "./ProjectMediaObjectUI";

export default {
  id: "object-project-media",
  name: "Media Pool Items",
  description: "Import, set, delete, rename, move or duplicate Media Pool items.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      mediaType: "any",
      findMode: "name",
      name: "",

      sourcePath: "",
      binMode: "current",
      binPath: "",

      newName: "",
      moveToBinPath: "",
      duplicateCount: 1,
    };
  },

  SettingsComponent: ProjectMediaObjectUI,
};