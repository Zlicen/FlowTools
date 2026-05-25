import { getReadableTextColor } from "../automationTheme";
import { moduleRegistry } from "../modules/moduleRegistry";
import { InfoIcon, WarningIcon } from "./EditorTooltip";
import { styles } from "./automationEditorStyles";

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

      <button
        type="button"
        style={{
          ...styles.modulePill,
          backgroundColor: categoryColor,
          color: textColor,
          ...(hasWarnings ? styles.warningModulePill : {}),
          ...(isSelected ? styles.selectedModulePill : {}),
          ...(isDraggingThisModule ? styles.draggingItem : {}),
        }}
        onPointerDown={(event) =>
          startPlacedModulePointerDrag(event, block, module, moduleKind, collectionKey)
        }
        onClick={(event) => {
          event.stopPropagation();
          setSelectedModuleId(module.id);
        }}
      >
        <WarningIcon warnings={warnings} />

        <span style={styles.pillName}>{definition?.name || module.type}</span>

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
      </button>

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

export default AutomationModulePill;