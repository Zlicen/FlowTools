import AutomationObjectUI from "./AutomationObjectUI";

export default {
  id: "object-automation",

  name: "Automation",

  description: "Run another saved automation from inside this automation.",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "run",
      automationId: "",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (!settings.automationId) {
      warnings.push("Choose an automation to run");
    }

    return warnings;
  },

  SettingsComponent: AutomationObjectUI,
};