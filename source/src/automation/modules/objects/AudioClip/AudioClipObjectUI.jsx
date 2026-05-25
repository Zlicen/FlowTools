import { useEffect, useRef, useState } from "react";

import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "duplicate", label: "Duplicate" },
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
  { value: "color", label: "Color" },
  { value: "split", label: "Split" },
];

const COLOR_OPTIONS = [
  { value: "Clear Color", label: "Clear Color", color: "transparent", isClear: true },
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

function cleanNumber(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function AudioTrackInput({ value, onChange }) {
  return (
    <div style={styles.trackInputRow}>
      <div style={styles.audioTrackPrefix}>A</div>

      <div style={styles.trackNumberInput}>
        <ModuleNumberInput
          min={1}
          value={value || 1}
          onChange={(nextValue) =>
            onChange(Math.max(1, cleanNumber(nextValue, 1)))
          }
        />
      </div>
    </div>
  );
}

function ColorDot({ color, isClear = false }) {
  return (
    <span
      style={{
        ...styles.colorDot,
        background: isClear ? "transparent" : color,
        border: isClear
          ? "1px solid #777"
          : "1px solid rgba(255,255,255,0.35)",
      }}
    />
  );
}

function ColorSelect({ value, onChange }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  const selected =
    COLOR_OPTIONS.find((option) => option.value === value) || COLOR_OPTIONS[9];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelectColor(option) {
    onChange(option.value);
    setHoveredValue(null);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={styles.colorSelectWrap}>
      <button
        type="button"
        style={{
          ...styles.colorSelectButton,
          ...(open ? styles.colorSelectButtonOpen : {}),
        }}
        onClick={() => setOpen((current) => !current)}
      >
        <span style={styles.colorLabel}>
          <ColorDot color={selected.color} isClear={selected.isClear} />
          {selected.label}
        </span>

        <span style={styles.chevron}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div style={styles.colorMenu}>
          {COLOR_OPTIONS.map((option) => {
            const isSelected = option.value === selected.value;
            const isHovered = option.value === hoveredValue;

            return (
              <button
                key={option.value}
                type="button"
                style={{
                  ...styles.colorOption,
                  ...(isHovered ? styles.colorOptionHover : {}),
                  ...(isSelected ? styles.colorOptionSelected : {}),
                }}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleSelectColor(option);
                }}
              >
                <span style={styles.colorLabel}>
                  <ColorDot color={option.color} isClear={option.isClear} />
                  {option.label}
                </span>

                {isSelected && <span style={styles.check}>✓</span>}
              </button>
            );
          })}
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

      <ModuleSettingsField label="Find Clip">
        <ModuleSelect
          value="underPlayhead"
          onChange={() => {}}
          options={[{ value: "underPlayhead", label: "Under Playhead" }]}
        />
      </ModuleSettingsField>

      <ModuleSettingsField label="Source Track">
        <AudioTrackInput
          value={settings.trackIndex ?? 1}
          onChange={(value) => update("trackIndex", value)}
        />
      </ModuleSettingsField>

      {action === "rename" && (
        <ModuleSettingsField label="New Clip Name">
          <ModuleTextInput
            value={settings.name ?? "Audio Clip"}
            placeholder="New clip name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate To Track">
          <AudioTrackInput
            value={settings.duplicateToTrackIndex ?? 2}
            onChange={(value) => update("duplicateToTrackIndex", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "color" && (
        <ModuleSettingsField label="Clip Color">
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
  trackInputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },

  audioTrackPrefix: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #3f8cff",
    background: "#101010",
    color: "#3f8cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },

  trackNumberInput: {
    flex: 1,
    minWidth: 0,
  },

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

  colorSelectButtonOpen: {
    borderColor: "#5b35ff",
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
    background: "transparent",
  },

  colorOptionHover: {
    background: "rgba(255,255,255,0.12)",
  },

  colorOptionSelected: {
    background: "rgba(91,53,255,0.28)",
  },

  colorLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  colorDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },

  chevron: {
    opacity: 0.65,
  },

  check: {
    opacity: 0.8,
  },
};

export default AudioClipObjectUI;