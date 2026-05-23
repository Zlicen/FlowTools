import { useState } from "react";

import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "duplicate", label: "Duplicate" },
  { value: "delete", label: "Delete" },
  { value: "color", label: "Color" },
];

const COLOR_OPTIONS = [
  { value: "Clear Color", label: "Clear Color", color: "transparent" },
  { value: "Orange", label: "Orange", color: "#ff8a00" },
  { value: "Apricot", label: "Apricot", color: "#ffb347" },
  { value: "Yellow", label: "Yellow", color: "#ffd84d" },
  { value: "Lime", label: "Lime", color: "#b8e62e" },
  { value: "Olive", label: "Olive", color: "#6fa83a" },
  { value: "Green", label: "Green", color: "#38b87c" },
  { value: "Teal", label: "Teal", color: "#22b8b8" },
  { value: "Navy", label: "Navy", color: "#1b78a8" },
  { value: "Blue", label: "Blue", color: "#4f91c9" },
  { value: "Purple", label: "Purple", color: "#9b6ab7" },
  { value: "Violet", label: "Violet", color: "#d46aa8" },
  { value: "Pink", label: "Pink", color: "#ee7fa8" },
  { value: "Tan", label: "Tan", color: "#c9b895" },
  { value: "Beige", label: "Beige", color: "#c9a678" },
  { value: "Brown", label: "Brown", color: "#a8742a" },
  { value: "Chocolate", label: "Chocolate", color: "#8a5a3a" },
];

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function ColorDot({ color, isClear = false }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: isClear ? "transparent" : color,
        border: isClear ? "1px solid #777" : "1px solid rgba(255,255,255,0.35)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function ColorSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected =
    COLOR_OPTIONS.find((option) => option.value === value) || COLOR_OPTIONS[9];

  return (
    <div style={styles.colorSelectWrap}>
      <button
        type="button"
        style={styles.colorSelectButton}
        onClick={() => setOpen((current) => !current)}
      >
        <span style={styles.colorLabel}>
          <ColorDot
            color={selected.color}
            isClear={selected.value === "Clear Color"}
          />
          {selected.label}
        </span>

        <span style={styles.chevron}>▾</span>
      </button>

      {open && (
        <div style={styles.colorMenu}>
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              style={{
                ...styles.colorOption,
                background:
                  option.value === selected.value
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
              }}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span style={styles.colorLabel}>
                <ColorDot
                  color={option.color}
                  isClear={option.value === "Clear Color"}
                />
                {option.label}
              </span>

              {option.value === selected.value && (
                <span style={styles.check}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AudioClipObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "duplicate";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Find by">
        <ModuleSelect
          value="underPlayhead"
          onChange={() => {}}
          options={[{ value: "underPlayhead", label: "Under playhead" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Audio Track">
        <ModuleNumberInput
          min={1}
          value={settings.trackIndex ?? 1}
          onChange={(value) =>
            update("trackIndex", Math.max(1, toNumber(value, 1)))
          }
        />
      </ModuleSettingsField>

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate To Audio Track">
          <ModuleNumberInput
            min={1}
            value={settings.duplicateToTrackIndex ?? 2}
            onChange={(value) =>
              update("duplicateToTrackIndex", Math.max(1, toNumber(value, 2)))
            }
          />
        </ModuleSettingsField>
      )}

      {action === "color" && (
        <ModuleSettingsField label="Color">
          <ColorSelect
            value={settings.color || "Blue"}
            onChange={(value) => update("color", value)}
          />
        </ModuleSettingsField>
      )}
    </ModuleSettingsBox>
  );
}

const styles = {
  colorSelectWrap: {
    position: "relative",
    width: "100%",
  },

  colorSelectButton: {
    width: "100%",
    background: "#111",
    color: "white",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "8px 9px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },

  colorMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#151515",
    border: "1px solid #333",
    borderRadius: 10,
    padding: 6,
    zIndex: 999,
    maxHeight: 260,
    overflowY: "auto",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },

  colorOption: {
    width: "100%",
    color: "white",
    border: "none",
    borderRadius: 7,
    padding: "7px 8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
  },

  colorLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  chevron: {
    opacity: 0.65,
  },

  check: {
    opacity: 0.8,
  },
};

export default AudioClipObjectUI;