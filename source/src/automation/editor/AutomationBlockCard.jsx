import { getReadableTextColor, automationTheme } from "../automationTheme";
import { styles } from "./automationEditorStyles";

function AutomationBlockCard({
  block,
  blockIndex,
  dragData,
  dropTarget,
  renamingBlockId,
  setRenamingBlockId,
  updateBlockName,
  copyBlock,
  deleteBlock,
  moveBlock,
  totalBlocks,
  toggleBlock,
  renderBlockLane,
  handleBlockDragOver,
  handleBlockDrop,
  onRunBlock,
}) {
  const blockTextColor = getReadableTextColor(automationTheme.blockColor);
  const isDraggingThisBlock =
    dragData?.source === "block" && dragData.blockId === block.id;

  return (
    <div
      style={{
        ...styles.blockCard,
        backgroundColor: automationTheme.blockColor,
        color: blockTextColor,
        ...(isDraggingThisBlock ? styles.draggingItem : {}),
      }}
      onDragOver={(event) => handleBlockDragOver(event, block.id)}
      onDrop={handleBlockDrop}
    >
      {dropTarget?.type === "block" &&
        dropTarget.blockId === block.id &&
        dropTarget.position === "before" && <div style={styles.blockDropLine} />}

      <div style={styles.blockHeader}>
        <div style={styles.blockTitleArea}>
          <div style={styles.blockMoveButtons}>
            <button
              style={{
                ...styles.blockMoveButton,
                ...(blockIndex === 0 ? styles.disabledBlockMoveButton : {}),
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                moveBlock(block.id, "up");
              }}
              title="Move block up"
              disabled={blockIndex === 0}
            >
              ↑
            </button>

            <button
              style={{
                ...styles.blockMoveButton,
                ...(blockIndex === totalBlocks - 1
                  ? styles.disabledBlockMoveButton
                  : {}),
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                moveBlock(block.id, "down");
              }}
              title="Move block down"
              disabled={blockIndex === totalBlocks - 1}
            >
              ↓
            </button>
          </div>

          <div style={styles.blockNumber}>{blockIndex + 1}</div>

          {renamingBlockId === block.id ? (
            <input
              style={styles.blockNameInput}
              value={block.name}
              autoFocus
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => updateBlockName(block, event.target.value)}
              onBlur={() => setRenamingBlockId(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setRenamingBlockId(null);
                if (event.key === "Escape") setRenamingBlockId(null);
              }}
            />
          ) : (
            <button
              style={styles.blockNameButton}
              onClick={() => toggleBlock(block)}
              title="Open/close block"
            >
              {block.name}
            </button>
          )}

          <button
            style={styles.renameButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setRenamingBlockId(block.id);
            }}
          >
            Rename
          </button>

          <span style={styles.blockStats}>
            {(block.modules || []).length} module
            {(block.modules || []).length === 1 ? "" : "s"}
          </span>
        </div>

        <div style={styles.blockButtons}>
          <button
            style={styles.runBlockButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              if (typeof onRunBlock === "function") {
                onRunBlock(block);
              }
            }}
            title="Run only this block"
          >
            ▶ Run
          </button>

          <button
            style={styles.iconButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              copyBlock(block.id);
            }}
            title="Duplicate block"
          >
            ⧉
          </button>

          <button
            style={styles.iconDeleteButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteBlock(block.id);
            }}
            title="Delete block"
          >
            ×
          </button>

          <button
            style={styles.expandButton}
            onClick={() => toggleBlock(block)}
            title="Open/close block"
          >
            {block.isOpen ? "▾" : "▸"}
          </button>
        </div>
      </div>

      {dropTarget?.type === "block" &&
        dropTarget.blockId === block.id &&
        dropTarget.position === "after" && <div style={styles.blockDropLine} />}

      {block.isOpen && (
        <div style={styles.blockBody}>
          {renderBlockLane({
            block,
            title: "Modules",
            collectionKey: "modules",
            moduleKind: "module",
          })}
        </div>
      )}
    </div>
  );
}

export default AutomationBlockCard;