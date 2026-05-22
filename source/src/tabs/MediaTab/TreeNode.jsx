import { useEffect, useState } from "react";
import { IconButton } from "../../components/ui";
import { useMediaStore } from "../../store";
import { mediaStyles as styles } from "./mediaStyles";

function TreeNode({ node, parentId, depth, isTopLevel = false }) {
  const {
    selectedFolderId,
    setSelectedFolderId,
    renameFolder,
    deleteFolder,
    toggleResolveVisibility,
    draggedFolder,
    setDraggedFolder,
    setFolderDropTarget,
    expandedFolderIds,
    toggleFolderExpanded,
    isSyncing,
  } = useMediaStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [draftName, setDraftName] = useState(node.name);

  const hasChildren = (node.folders || []).length > 0;
  const isExpanded = expandedFolderIds?.[node.id] !== false;
  const isSelected = selectedFolderId === node.id;
  const isShownInResolve = node.type === "power";
  const childWidth = Math.max(72, 100 - depth * 7);

  useEffect(() => {
    setDraftName(node.name);
  }, [node.name]);

  async function saveRename() {
    const cleanName = draftName.trim();

    if (!cleanName) {
      setDraftName(node.name);
      setIsRenaming(false);
      return;
    }

    await renameFolder(node.id, cleanName);
    setIsRenaming(false);
  }

  function handleDragStart(event) {
    if (isRenaming || isSyncing) {
      event.preventDefault();
      return;
    }

    const payload = {
      id: node.id,
      parentId,
      name: node.name,
    };

    setDraggedFolder(payload);
    setFolderDropTarget(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", node.name);
  }

  function handleDragEnd() {
    setDraggedFolder(null);
    setFolderDropTarget(null);
  }

  return (
    <div style={styles.treeNodeOuter}>
      <div
        draggable={!isRenaming && !isSyncing}
        data-media-folder-row="true"
        data-folder-id={node.id}
        data-parent-id={parentId || ""}
        data-depth={depth}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedFolderId(node.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.treeNode,
          marginLeft: depth * 16,
          width: `${childWidth}%`,
          minHeight: depth > 0 ? 30 : 34,
          padding: depth > 0 ? "5px 7px" : "7px 7px",
          cursor: isRenaming ? "text" : "grab",
          backgroundColor: isSelected
            ? "#2f2a46"
            : isHovered
              ? "#292929"
              : "#202020",
          borderColor: isSelected ? "#7357ff" : "#383838",
          opacity: draggedFolder?.id === node.id ? 0.55 : 1,
        }}
      >
        <button
          type="button"
          style={{
            ...styles.expandButton,
            opacity: hasChildren ? 1 : 0.25,
            cursor: hasChildren ? "pointer" : "default",
          }}
          onClick={(event) => {
            event.stopPropagation();

            if (hasChildren) {
              toggleFolderExpanded(node.id);
            }
          }}
          title={isExpanded ? "Collapse folder" : "Expand folder"}
        >
          {hasChildren ? (isExpanded ? "▾" : "▸") : "•"}
        </button>

        <span style={styles.treeIcon}>{isShownInResolve ? "👁" : "📁"}</span>

        {isRenaming ? (
          <input
            style={styles.treeRenameInput}
            value={draftName}
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={saveRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveRename();
              }

              if (event.key === "Escape") {
                setDraftName(node.name);
                setIsRenaming(false);
              }
            }}
          />
        ) : (
          <span style={styles.treeName}>{node.name}</span>
        )}

        <div
          style={{
            ...styles.treeActions,
            opacity: isHovered || isSelected ? 1 : 0,
          }}
        >
          {isTopLevel && (
            <IconButton
              size={24}
              variant="rename"
              onClick={(event) => {
                event.stopPropagation();
                toggleResolveVisibility(node);
              }}
              disabled={isSyncing}
              title={
                isShownInResolve
                  ? "Hide from DaVinci Resolve"
                  : "Show in DaVinci Resolve"
              }
              style={styles.treeActionButton}
            >
              {isShownInResolve ? "👁" : "⊘"}
            </IconButton>
          )}

          <IconButton
            size={24}
            variant="rename"
            onClick={(event) => {
              event.stopPropagation();
              setIsRenaming(true);
            }}
            disabled={isSyncing}
            title="Rename"
            style={styles.treeActionButton}
          >
            ✎
          </IconButton>

          <IconButton
            size={24}
            variant="delete"
            onClick={(event) => {
              event.stopPropagation();
              deleteFolder(node.id);
            }}
            disabled={isSyncing}
            title="Delete"
            style={styles.treeActionButton}
          >
            ×
          </IconButton>
        </div>
      </div>

      {isExpanded &&
        (node.folders || []).map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            parentId={node.id}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export default TreeNode;