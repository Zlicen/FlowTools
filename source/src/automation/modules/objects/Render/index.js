import RenderObjectUI from "./RenderObjectUI";

export default {
  id: "object-render",
  name: "Render",
  description: "Set, delete or start render jobs.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "set",

      renderMode: "currentTimeline",
      preset: "current",
      outputName: "",
      outputFolder: "",
    };
  },

  SettingsComponent: RenderObjectUI,
};