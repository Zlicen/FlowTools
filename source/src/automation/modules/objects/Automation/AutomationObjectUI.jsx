import { useEffect } from "react";

import {
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
} from "../../../components";

import { useAutomationStore } from "../../../../store";

const ACTION_OPTIONS = [{ value: "run", label: "Run" }];

function AutomationObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const { automations } = useAutomationStore();

  const automationOptions = automations.map((automation) => ({
    value: automation.id,
    label: automation.name || "Unnamed Automation",
  }));

  const firstAutomationId = automationOptions[0]?.value || "";

  const selectedAutomationExists = automationOptions.some(
    (option) => option.value === settings.automationId
  );

  const selectedAutomationId = selectedAutomationExists
    ? settings.automationId
    : firstAutomationId;

  const options =
    automationOptions.length > 0
      ? automationOptions
      : [{ value: "", label: "No automations saved" }];

  function updateSettings(nextSettings) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        ...nextSettings,
      },
    });
  }

  useEffect(() => {
    if (!settings.automationId && firstAutomationId) {
      updateSettings({
        action: settings.action || "run",
        automationId: firstAutomationId,
      });
    }
  }, [settings.automationId, firstAutomationId]);

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={settings.action || "run"}
          options={ACTION_OPTIONS}
          onChange={(value) => updateSettings({ action: value })}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Automation">
        <ModuleSelect
          value={selectedAutomationId}
          options={options}
          onChange={(value) => updateSettings({ automationId: value })}
        />
      </ModuleSettingsField>
    </ModuleSettingsBox>
  );
}

export default AutomationObjectUI;