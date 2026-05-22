import TreeNode from "./TreeNode";
import { mediaStyles as styles } from "./mediaStyles";
import { useMediaStore } from "../../store";
import { findNodeById } from "./mediaTreeHelpers";

function containsFolderId(folder, id) {
  if (!folder || !id) return false;

  for (const child of folder.folders || []) {
    if (child.id === id) return true;
    if (containsFolderId(child, id)) return true;
  }

  return false;
}

function getDropPosition(mouseY, rect) {
  const localY = mouseY - rect.top;

  if (localY < rect.height * 0.33) return "before";
  if (localY > rect.height * 0.66) return "after";

  return "inside";
}

function getClosestRow(event, groupElement) {
  const rows = Array.from(
    groupElement.querySelectorAll("[data-media-folder-row='true']")
  );

  if (rows.length === 0) return null;

  const mouseY = event.clientY;

  const directRow = rows.find((row) => {
    const rect = row.getBoundingClientRect();
    return mouseY >= rect.top && mouseY <= rect.bottom;
  });

  if (directRow) return directRow;

  let closestRow = null;
  let closestDistance = Infinity;

  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    const distance = Math.min(
      Math.abs(mouseY - rect.top),
      Math.abs(mouseY - rect.bottom)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestRow = row;
    }
  }

  return closestRow;
}

function createDropTarget(event, groupElement, draggedFolder, bins) {
  const row = getClosestRow(event, groupElement);

  if (!row) return null;

  const rect = row.getBoundingClientRect();
  const groupRect = groupElement.getBoundingClientRect();

  const targetId = row.dataset.folderId;
  const targetParentId = row.dataset.parentId || null;
  const depth = Number(row.dataset.depth || 0);

  if (!targetId || targetId === draggedFolder?.id) return null;

  const draggedNode = findNodeById(bins, draggedFolder?.id);

  if (containsFolderId(draggedNode, targetId)) return null;

  const position = getDropPosition(event.clientY, rect);
  const lineDepth = position === "inside" ? depth + 1 : depth;
  const lineLeft = groupRect.left + lineDepth * 16 + 8;
  const lineRightPadding = 12;
  const lineWidth = Math.max(
    40,
    rect.width - lineDepth * 16 - lineRightPadding
  );

  return {
    targetId,
    targetParentId,
    position,
    lineTop: position === "before" ? rect.top - 2 : rect.bottom - 2,
    lineLeft,
    lineWidth,
  };
}

function TreeGroup({ title, bins, power = false }) {
  const {
    bins: allBins,
    draggedFolder,
    setDraggedFolder,
    folderDropTarget,
    setFolderDropTarget,
    reorderFolders,
    setFolderExpanded,
  } = useMediaStore();

  function clearDrag() {
    setDraggedFolder(null);
    setFolderDropTarget(null);
  }

  function handleDragOver(event) {
    if (!draggedFolder) return;

    event.preventDefault();

    const nextTarget = createDropTarget(
      event,
      event.currentTarget,
      draggedFolder,
      allBins
    );

    setFolderDropTarget(nextTarget);
  }

  async function handleDrop(event) {
    event.preventDefault();

    if (!draggedFolder || !folderDropTarget) {
      clearDrag();
      return;
    }

    await reorderFolders({
      draggedId: draggedFolder.id,
      sourceParentId: draggedFolder.parentId,
      targetId: folderDropTarget.targetId,
      targetParentId: folderDropTarget.targetParentId,
      position: folderDropTarget.position,
    });

    if (folderDropTarget.position === "inside") {
      setFolderExpanded(folderDropTarget.targetId, true);
    }

    clearDrag();
  }

  function handleDragLeave(event) {
    const nextElement = event.relatedTarget;

    if (nextElement && event.currentTarget.contains(nextElement)) return;

    setFolderDropTarget(null);
  }

  return (
    <section
      style={styles.treeGroup}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <h3 style={styles.treeTitle}>{title}</h3>

      {bins.length === 0 ? (
        <div style={styles.treeEmpty}>No bins yet.</div>
      ) : (
        bins.map((bin) => (
          <TreeNode
            key={bin.id}
            node={bin}
            parentId={null}
            depth={0}
            power={power}
            isTopLevel
          />
        ))
      )}

      {folderDropTarget && draggedFolder && (
        <div
          style={{
            ...styles.folderDropLine,
            top: folderDropTarget.lineTop,
            left: folderDropTarget.lineLeft,
            width: folderDropTarget.lineWidth,
          }}
        />
      )}
    </section>
  );
}

export default TreeGroup;