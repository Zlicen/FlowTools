import { useEffect, useRef, useState } from "react";

import {
  ModuleNumberInput,
  ModuleSelect,
  ModuleSettingsBox,
  ModuleSettingsField,
  ModuleTextInput,
} from "../../../components";

const ACTION_OPTIONS = [
  { value: "add", label: "Add" },
  { value: "duplicate", label: "Duplicate" },
];

const POSITION_OPTIONS = [
  { value: "currentPlayhead", label: "Current Playhead" },
  { value: "frame", label: "Specific Frame" },
  { value: "timecode", label: "Specific Timecode" },
];

const COLOR_OPTIONS = [
  { value: "Blue", label: "Blue", color: "#2f8cff" },
  { value: "Cyan", label: "Cyan", color: "#24d6d6" },
  { value: "Green", label: "Green", color: "#3fd13f" },
  { value: "Yellow", label: "Yellow", color: "#ffd12a" },
  { value: "Red", label: "Red", color: "#ff3b24" },
  { value: "Pink", label: "Pink", color: "#f04bd6" },
  { value: "Purple", label: "Purple", color: "#9b4df2" },
  { value: "Fuchsia", label: "Fuchsia", color: "#d94a9b" },
  { value: "Rose", label: "Rose", color: "#ff8fb3" },
  { value: "Lavender", label: "Lavender", color: "#b7a7e8" },
  { value: "Sky", label: "Sky", color: "#8ed8ff" },
  { value: "Mint", label: "Mint", color: "#76ff3b" },
  { value: "Lemon", label: "Lemon", color: "#e7ff3f" },
  { value: "Sand", label: "Sand", color: "#d8a35e" },
  { value: "Cocoa", label: "Cocoa", color: "#9b6a4a" },
  { value: "Cream", label: "Cream", color: "#eaded1" },
];

function clampNumber(value, min = 0, max = null) {
  const number = Number(value);
  const clean = Number.isFinite(number) ? number : min;
  const clampedMin = Math.max(min, clean);
  return max === null ? clampedMin : Math.min(max, clampedMin);
}

function pad2(value) {
  return String(clampNumber(value, 0)).padStart(2, "0");
}

function parseTimecode(timecode) {
  const parts = String(timecode || "00:00:00:00")
    .split(":")
    .map((part) => Number(part));

  return {
    hours: Number.isFinite(parts[0]) ? parts[0] : 0,
    minutes: Number.isFinite(parts[1]) ? parts[1] : 0,
    seconds: Number.isFinite(parts[2]) ? parts[2] : 0,
    frames: Number.isFinite(parts[3]) ? parts[3] : 0,
  };
}

function buildTimecode(parts) {
  return [
    pad2(parts.hours),
    pad2(clampNumber(parts.minutes, 0, 59)),
    pad2(clampNumber(parts.seconds, 0, 59)),
    pad2(parts.frames),
  ].join(":");
}

function ColorDot({ color }) {
  return <span style={{ ...styles.colorDot, background: color }} />;
}

function ColorSelect({ value, onChange }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  const selected =
    COLOR_OPTIONS.find((option) => option.value === value) || COLOR_OPTIONS[0];

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
          <ColorDot color={selected.color} />
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
                  <ColorDot color={option.color} />
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

function TimecodeSmallInput({ label, value, max, onChange }) {
  return (
    <div style={styles.timecodePart}>
      <span style={styles.timecodeLabel}>{label}</span>

      <input
        type="number"
        min={0}
        max={max ?? undefined}
        value={value}
        onChange={(event) => {
          const nextValue = clampNumber(event.target.value, 0, max ?? null);
          onChange(nextValue);
        }}
        style={styles.timecodeInput}
      />
    </div>
  );
}

function TimecodeInput({ value, onChange }) {
  const current = parseTimecode(value);

  function updatePart(key, nextValue) {
    const next = {
      ...current,
      [key]: nextValue,
    };

    onChange(buildTimecode(next));
  }

  return (
    <div style={styles.timecodeWrap}>
      <TimecodeSmallInput
        label="HH"
        value={current.hours}
        onChange={(value) => updatePart("hours", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="MM"
        value={current.minutes}
        max={59}
        onChange={(value) => updatePart("minutes", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="SS"
        value={current.seconds}
        max={59}
        onChange={(value) => updatePart("seconds", value)}
      />

      <span style={styles.timecodeSeparator}>:</span>

      <TimecodeSmallInput
        label="FF"
        value={current.frames}
        onChange={(value) => updatePart("frames", value)}
      />
    </div>
  );
}

function MarkerObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "add";
  const position = settings.position || "currentPlayhead";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  const needsFindByName =
    action === "move" ||
    action === "duplicate" ||
    action === "rename" ||
    action === "delete" ||
    action === "color" ||
    action === "note";

  const needsPosition =
    action === "add" || action === "move" || action === "duplicate";

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          onChange={(value) => update("action", value)}
          options={ACTION_OPTIONS}
        />
      </ModuleSettingsField>

      {needsFindByName && (
        <ModuleSettingsField label="Source Marker">
          <ModuleTextInput
            value={settings.markerName || ""}
            placeholder="Existing marker name..."
            onChange={(value) => update("markerName", value)}
          />
        </ModuleSettingsField>
      )}

      {needsPosition && (
        <>
          <ModuleSettingsField
            label={
              action === "add"
                ? "Add Marker At"
                : action === "move"
                  ? "Move Marker To"
                  : "Duplicate Marker To"
            }
          >
            <ModuleSelect
              value={position}
              onChange={(value) => update("position", value)}
              options={POSITION_OPTIONS}
            />
          </ModuleSettingsField>

          {position === "frame" && (
            <ModuleSettingsField label="Target Frame">
              <ModuleNumberInput
                min={0}
                value={settings.frame || 0}
                onChange={(value) =>
                  update("frame", Math.max(0, Number(value) || 0))
                }
              />
            </ModuleSettingsField>
          )}

          {position === "timecode" && (
            <ModuleSettingsField label="Target Timecode">
              <TimecodeInput
                value={settings.timecode || "00:00:00:00"}
                onChange={(value) => update("timecode", value)}
              />
            </ModuleSettingsField>
          )}
        </>
      )}

      {action === "add" && (
        <>
          <ModuleSettingsField label="Marker Name">
            <ModuleTextInput
              value={settings.name || ""}
              placeholder="Marker name..."
              onChange={(value) => update("name", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Marker Color">
            <ColorSelect
              value={settings.color || "Blue"}
              onChange={(value) => update("color", value)}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Marker Note">
            <ModuleTextInput
              value={settings.note || ""}
              placeholder="Marker note..."
              onChange={(value) => update("note", value)}
            />
          </ModuleSettingsField>
        </>
      )}

      {action === "rename" && (
        <ModuleSettingsField label="New Marker Name">
          <ModuleTextInput
            value={settings.newName || ""}
            placeholder="New marker name..."
            onChange={(value) => update("newName", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "color" && (
        <ModuleSettingsField label="New Marker Color">
          <ColorSelect
            value={settings.newColor || "Blue"}
            onChange={(value) => update("newColor", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "note" && (
        <ModuleSettingsField label="New Marker Note">
          <ModuleTextInput
            value={settings.newNote || ""}
            placeholder="New marker note..."
            onChange={(value) => update("newNote", value)}
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
    border: "1px solid rgba(255,255,255,0.35)",
    display: "inline-block",
    flexShrink: 0,
  },

  chevron: {
    opacity: 0.65,
  },

  check: {
    opacity: 0.8,
  },

  timecodeWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
    width: "100%",
    minWidth: 0,
  },

  timecodePart: {
    width: 48,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  timecodeLabel: {
    fontSize: 9,
    opacity: 0.6,
    fontWeight: 700,
    lineHeight: 1,
  },

  timecodeInput: {
    width: "100%",
    height: 32,
    boxSizing: "border-box",
    background: "#101010",
    color: "white",
    border: "1px solid #333",
    borderRadius: 7,
    padding: "0 5px",
    fontSize: 12,
    fontWeight: 600,
    outline: "none",
  },

  timecodeSeparator: {
    paddingBottom: 8,
    opacity: 0.55,
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
  },
};

export default MarkerObjectUI;