import { useState } from "react";
import { IconButton } from "../../components/ui";
import { getDragPreviewStyle } from "../../hooks/useDragPreview";
import { useReorderDrag } from "../../hooks/useReorderDrag";
import { useMediaStore } from "../../store";
import { getMediaIcon } from "./mediaTreeHelpers";
import { mediaStyles as styles } from "./mediaStyles";

function MediaCard({ item, folderId }) {
  const {
    draggedMedia,
    setDraggedMedia,
    mediaDropTarget,
    setMediaDropTarget,
    previewMediaReorder,
    reorderMedia,
    deleteMedia,
    isSyncing,
  } = useMediaStore();

  const [isHovered, setIsHovered] = useState(false);

  const { isDragging, dragProps } = useReorderDrag({
    id: item.id,
    type: "media",
    disabled: false,
    mode: "grid",
    group: `media-items-${folderId}`,
    draggedItem: draggedMedia,
    setDraggedItem: setDraggedMedia,
    dropTarget: mediaDropTarget,
    setDropTarget: setMediaDropTarget,
    getDragPayload: () => ({
      id: item.id,
      folderId,
    }),
    canDrop: (dragItem) => dragItem.folderId === folderId,
    onReorderPreview: (dragItem, targetId, position) => {
      previewMediaReorder(folderId, dragItem.id, targetId, position);
    },
    onDrop: (dragItem, targetId, position) => {
      reorderMedia(folderId, dragItem.id, targetId, position);
    },
  });

  return (
    <div style={styles.mediaCardWrap}>
      <div
        {...dragProps}
        style={{
          ...styles.mediaCard,
          backgroundColor: isHovered ? "#202020" : "#181818",
          ...getDragPreviewStyle(isDragging),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.mediaCardHeader}>
          <div style={styles.mediaIcon}>{getMediaIcon(item.name)}</div>

          <IconButton
            size={26}
            variant="delete"
            disabled={isSyncing}
            title="Delete media from this folder"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteMedia(folderId, item.id);
            }}
            style={{
              opacity: isHovered ? 1 : 0,
              fontSize: "12px",
            }}
          >
            ✕
          </IconButton>
        </div>

        <div style={styles.mediaName}>{item.name}</div>
        <div style={styles.mediaPath}>{item.filePath}</div>
      </div>
    </div>
  );
}

export default MediaCard;