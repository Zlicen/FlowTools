import { useState } from "react";

import { chooseLutFile } from "../../../../api/fileDialogAPI";

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
  { value: "lut", label: "Apply LUT" },
  { value: "position", label: "Transform Position" },
  { value: "zoom", label: "Zoom" },
  { value: "rotation", label: "Rotation" },
  { value: "crop", label: "Crop" },
  { value: "opacity", label: "Opacity" },
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

function cleanNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function VideoTrackInput({ value, onChange }) {
  return (
    <div style={styles.trackInputRow}>
      <div style={styles.videoTrackPrefix}>V</div>

      <div style={styles.trackNumberInput}>
        <ModuleNumberInput
          min={1}
          value={value || 1}
          onChange={(nextValue) =>
            onChange(Math.max(1, Number(nextValue) || 1))
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
          <ColorDot color={selected.color} isClear={selected.isClear} />
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
                <ColorDot color={option.color} isClear={option.isClear} />
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

export default function VideoClipObjectUI({ module, onUpdate }) {
  const settings = module.settings || {};
  const action = settings.action || "position";

  function update(key, value) {
    onUpdate({
      ...module,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  async function browseLutFile() {
    const filePath = await chooseLutFile();

    if (filePath) {
      update("lutPath", filePath);
    }
  }

  return (
    <ModuleSettingsBox>
      <ModuleSettingsField label="Action">
        <ModuleSelect
          value={action}
          options={ACTION_OPTIONS}
          onChange={(value) => update("action", value)}
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
        <VideoTrackInput
          value={settings.trackIndex ?? 1}
          onChange={(value) => update("trackIndex", value)}
        />
      </ModuleSettingsField>

      {action === "rename" && (
        <ModuleSettingsField label="New Clip Name">
          <ModuleTextInput
            value={settings.name ?? "Video Clip"}
            placeholder="New clip name..."
            onChange={(value) => update("name", value)}
          />
        </ModuleSettingsField>
      )}

      {action === "position" && (
        <>
          <ModuleSettingsField label="Position X">
            <ModuleNumberInput
              value={settings.positionX ?? 0}
              onChange={(value) => update("positionX", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Position Y">
            <ModuleNumberInput
              value={settings.positionY ?? 0}
              onChange={(value) => update("positionY", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>
        </>
      )}

      {action === "zoom" && (
        <ModuleSettingsField label="Zoom Amount">
          <ModuleNumberInput
            value={settings.zoom ?? 1}
            step={0.1}
            onChange={(value) => update("zoom", cleanNumber(value, 1))}
          />
        </ModuleSettingsField>
      )}

      {action === "rotation" && (
        <ModuleSettingsField label="Rotation Angle">
          <ModuleNumberInput
            value={settings.rotationAngle ?? 0}
            onChange={(value) =>
              update("rotationAngle", cleanNumber(value, 0))
            }
          />
        </ModuleSettingsField>
      )}

      {action === "crop" && (
        <>
          <ModuleSettingsField label="Crop Left">
            <ModuleNumberInput
              min={0}
              value={settings.cropLeft ?? 0}
              onChange={(value) => update("cropLeft", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Right">
            <ModuleNumberInput
              min={0}
              value={settings.cropRight ?? 0}
              onChange={(value) => update("cropRight", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Top">
            <ModuleNumberInput
              min={0}
              value={settings.cropTop ?? 0}
              onChange={(value) => update("cropTop", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Bottom">
            <ModuleNumberInput
              min={0}
              value={settings.cropBottom ?? 0}
              onChange={(value) => update("cropBottom", cleanNumber(value, 0))}
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="Crop Softness">
            <ModuleNumberInput
              min={0}
              value={settings.cropSoftness ?? 0}
              onChange={(value) =>
                update("cropSoftness", cleanNumber(value, 0))
              }
            />
          </ModuleSettingsField>
        </>
      )}

      {action === "opacity" && (
        <ModuleSettingsField label="Opacity">
          <ModuleNumberInput
            value={settings.opacity ?? 100}
            min={0}
            max={100}
            onChange={(value) => update("opacity", cleanNumber(value, 100))}
          />
        </ModuleSettingsField>
      )}

      {action === "duplicate" && (
        <ModuleSettingsField label="Duplicate To Track">
          <VideoTrackInput
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

      {action === "lut" && (
        <>
          <ModuleSettingsField label="Color Node">
            <ModuleNumberInput
              value={settings.nodeIndex ?? 1}
              min={1}
              onChange={(value) =>
                update("nodeIndex", Math.max(1, Number(value) || 1))
              }
            />
          </ModuleSettingsField>

          <ModuleSettingsField label="LUT File">
            <div style={styles.filePickerRow}>
              <ModuleTextInput
                value={settings.lutPath ?? ""}
                placeholder="Choose LUT file..."
                onChange={(value) => update("lutPath", value)}
              />

              <button
                type="button"
                style={styles.browseButton}
                onClick={browseLutFile}
              >
                Browse
              </button>
            </div>
          </ModuleSettingsField>
        </>
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

  videoTrackPrefix: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #55b86a",
    background: "#101010",
    color: "#55b86a",
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

  filePickerRow: {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 66px",
  gap: 8,
  width: "100%",
  minWidth: 0,
},

browseButton: {
  height: 34,
  width: 66,
  padding: 0,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#181818",
  color: "white",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
},
};