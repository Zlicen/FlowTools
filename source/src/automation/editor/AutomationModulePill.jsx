import { getReadableTextColor } from "../automationTheme";
import { moduleRegistry } from "../modules/moduleRegistry";
import { InfoIcon, WarningIcon } from "./EditorTooltip";
import { styles } from "./automationEditorStyles";

function titleCase(value) {
  return String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getActionLabel(module) {
  const settings = module.settings || {};
  const action = settings.action || "default";

  const labels = {
    add: "Add",
    rename: "Rename",
    delete: "Delete",
    duplicate: "Duplicate",
    color: "Color",
    split: "Split",
    move: "Move",
    create: "Create",
    position: "Position",
    zoom: "Zoom",
    rotation: "Rotation",
    crop: "Crop",
    opacity: "Opacity",
    lut: "Apply LUT",
    speed: "Speed",
    transform: "Transform",
  };

  if (module.type === "object-compound-clip") {
    return "Create";
  }

  return labels[action] || titleCase(action);
}

function getTrackBadge(module) {
  const settings = module.settings || {};

  if (module.type === "object-track") {
    const prefix = settings.trackType === "audio" ? "A" : "V";
    return `${prefix}${settings.trackIndex || 1}`;
  }

  if (module.type === "object-video-clip") {
    return `V${settings.trackIndex || 1}`;
  }

  if (module.type === "object-audio-clip") {
    return `A${settings.trackIndex || 1}`;
  }

  if (module.type === "object-compound-clip") {
    const sourceMode = settings.sourceMode || "both";
    const videoTracks = String(settings.videoTracks || "1").trim();
    const audioTracks = String(settings.audioTracks || "1").trim();

    if (sourceMode === "video") return `V${videoTracks}`;
    if (sourceMode === "audio") return `A${audioTracks}`;

    return `V${videoTracks}+A${audioTracks}`;
  }

  return "";
}

function getValueBadge() {
  return "";
}

function AutomationModulePill({
  module,
  block,
  moduleKind,
  collectionKey,
  index,
  selectedModuleId,
  setSelectedModuleId,
  dragData,
  dropTarget,
  moduleWarningsById,
  getCategoryColor,
  copyModule,
  deleteModule,
  handleZoneDrop,
  handleModuleDragOver,
  startPlacedModulePointerDrag,
}) {
  const definition = moduleRegistry[module.type];
  const isSelected = selectedModuleId === module.id;
  const categoryColor = getCategoryColor(definition?.categoryId);
  const textColor = getReadableTextColor(categoryColor);
  const warnings = moduleWarningsById[module.id] || [];
  const hasWarnings = warnings.length > 0;
  const actionLabel = getActionLabel(module);
  const trackBadge = getTrackBadge(module);
  const valueBadge = getValueBadge(module);

  const isDraggingThisModule =
    dragData?.source === "placed-module" && dragData.moduleId === module.id;

  const showBefore =
    dropTarget?.type === collectionKey &&
    dropTarget?.blockId === block.id &&
    dropTarget?.moduleId === module.id &&
    dropTarget?.position === "before";

  const showAfter =
    dropTarget?.type === collectionKey &&
    dropTarget?.blockId === block.id &&
    dropTarget?.moduleId === module.id &&
    dropTarget?.position === "after";

  return (
    <div
      style={styles.moduleWrap}
      data-automation-module-id={module.id}
      data-block-id={block.id}
      data-collection-key={collectionKey}
      onDragOver={(event) =>
        handleModuleDragOver(event, block, module, moduleKind, index)
      }
      onDrop={(event) => handleZoneDrop(event, block, collectionKey)}
    >
      {showBefore && (
        <div
          style={{
            ...styles.moduleDropLine,
            top: -4,
          }}
        />
      )}

      <div
        role="button"
        tabIndex={0}
        style={{
          ...styles.modulePill,
          ...localStyles.modulePillCompact,
          backgroundColor: categoryColor,
          color: textColor,
          ...(hasWarnings ? styles.warningModulePill : {}),
          ...(isSelected ? styles.selectedModulePill : {}),
          ...(isDraggingThisModule ? styles.draggingItem : {}),
        }}
        onPointerDown={(event) =>
          startPlacedModulePointerDrag(
            event,
            block,
            module,
            moduleKind,
            collectionKey
          )
        }
        onClick={(event) => {
          event.stopPropagation();
          setSelectedModuleId(module.id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedModuleId(module.id);
          }
        }}
      >
        <WarningIcon warnings={warnings} />

        <span style={styles.pillName}>{definition?.name || module.type}</span>

        {trackBadge && <span style={localStyles.trackBadge}>{trackBadge}</span>}

        {valueBadge && <span style={localStyles.valueBadge}>{valueBadge}</span>}

        <span style={localStyles.actionBadge}>{actionLabel}</span>

        <InfoIcon text={definition?.description} />

        <span style={styles.pillButtons}>
          <button
            type="button"
            style={styles.pillMiniButton}
            title="Duplicate module"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              copyModule(block, collectionKey, module);
            }}
          >
            ⧉
          </button>

          <button
            type="button"
            style={styles.pillMiniDeleteButton}
            title="Delete module"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteModule(block, collectionKey, module.id);
            }}
          >
            ×
          </button>
        </span>
      </div>

      {showAfter && (
        <div
          style={{
            ...styles.moduleDropLine,
            bottom: -4,
          }}
        />
      )}
    </div>
  );
}

const localStyles = {
  modulePillCompact: {
    minHeight: "34px",
    padding: "8px 9px",
  },

  trackBadge: {
    flexShrink: 0,
    borderRadius: "999px",
    padding: "3px 7px",
    backgroundColor: "rgba(255,255,255,0.18)",
    fontSize: "11px",
    fontWeight: "900",
    lineHeight: 1,
  },

  valueBadge: {
    flexShrink: 0,
    borderRadius: "999px",
    padding: "3px 7px",
    backgroundColor: "rgba(0,0,0,0.18)",
    fontSize: "11px",
    fontWeight: "800",
    lineHeight: 1,
  },

  actionBadge: {
    flexShrink: 0,
    borderRadius: "999px",
    padding: "3px 8px",
    backgroundColor: "rgba(0,0,0,0.25)",
    fontSize: "11px",
    fontWeight: "900",
    lineHeight: 1,
  },
};

export default AutomationModulePill;