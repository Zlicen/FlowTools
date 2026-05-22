import { useEffect, useRef, useState } from "react";

const reorderAnimationState = new Map();

export function getVerticalDropPosition(eventOrPoint, element) {
  const rect = element
    ? element.getBoundingClientRect()
    : eventOrPoint.currentTarget.getBoundingClientRect();
  const clientY = element ? eventOrPoint.clientY : eventOrPoint.clientY;
  const y = clientY - rect.top;
  return y < rect.height / 2 ? "before" : "after";
}

export function getHorizontalDropPosition(eventOrPoint, element) {
  const rect = element
    ? element.getBoundingClientRect()
    : eventOrPoint.currentTarget.getBoundingClientRect();
  const clientX = element ? eventOrPoint.clientX : eventOrPoint.clientX;
  const x = clientX - rect.left;
  return x < rect.width / 2 ? "before" : "after";
}

export function getGridDropPosition(eventOrPoint, element) {
  return getHorizontalDropPosition(eventOrPoint, element);
}

export function isMatchingDropTarget(dropTarget, id, position) {
  return dropTarget?.id === id && dropTarget?.position === position;
}

export function reorderItems(items, draggedId, targetId, position = "before") {
  if (!Array.isArray(items)) return [];
  if (!draggedId || !targetId || draggedId === targetId) return items;

  const nextItems = [...items];
  const draggedIndex = nextItems.findIndex((item) => item.id === draggedId);
  const targetIndex = nextItems.findIndex((item) => item.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) return items;

  const [draggedItem] = nextItems.splice(draggedIndex, 1);
  const updatedTargetIndex = nextItems.findIndex((item) => item.id === targetId);

  if (updatedTargetIndex === -1) return items;

  const insertIndex = position === "before"
    ? updatedTargetIndex
    : updatedTargetIndex + 1;

  nextItems.splice(insertIndex, 0, draggedItem);
  return nextItems;
}

function getPositionFromMode(mode, eventOrPoint, element) {
  if (mode === "horizontal") return getHorizontalDropPosition(eventOrPoint, element);
  if (mode === "grid") return getGridDropPosition(eventOrPoint, element);
  return getVerticalDropPosition(eventOrPoint, element);
}

function getGroupSelector(group) {
  if (!group || typeof CSS === "undefined" || !CSS.escape) {
    return "[data-reorder-id]";
  }

  return `[data-reorder-group="${CSS.escape(group)}"]`;
}

function captureRects(group) {
  if (typeof document === "undefined") return;

  const rects = new Map();
  const elements = document.querySelectorAll(getGroupSelector(group));

  elements.forEach((element) => {
    const id = element.getAttribute("data-reorder-id");
    if (!id) return;
    rects.set(id, element.getBoundingClientRect());
  });

  reorderAnimationState.set(group || "global", rects);
}

function animateRects(group, draggedId) {
  if (typeof document === "undefined") return;

  const key = group || "global";
  const previousRects = reorderAnimationState.get(key);
  if (!previousRects) return;

  const elements = document.querySelectorAll(getGroupSelector(group));

  elements.forEach((element) => {
    const id = element.getAttribute("data-reorder-id");
    const previousRect = previousRects.get(id);

    if (!id || !previousRect) return;

    const nextRect = element.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (!deltaX && !deltaY) return;

    element.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px)`,
          zIndex: id === draggedId ? 5 : 1,
        },
        {
          transform: "translate(0, 0)",
          zIndex: id === draggedId ? 5 : 1,
        },
      ],
      {
        duration: 170,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "both",
      }
    );
  });

  reorderAnimationState.delete(key);
}

function animateAfterStateChange(group, draggedId) {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      animateRects(group, draggedId);
    });
  });
}

function getDraggedMovingRect(start, clientX, clientY) {
  if (!start?.rect) return null;

  const width = start.rect.width;
  const height = start.rect.height;

  // Important: while reordering, the dragged item's visual center should
  // always be under the mouse. This makes the crossing math feel like
  // Chrome tabs instead of using the original grab offset.
  return {
    top: clientY - height / 2,
    bottom: clientY + height / 2,
    left: clientX - width / 2,
    right: clientX + width / 2,
    centerX: clientX,
    centerY: clientY,
    width,
    height,
  };
}

function getMovementDirection(previousPoint, clientX, clientY, mode) {
  if (!previousPoint) return 0;

  if (mode === "horizontal" || mode === "grid") {
    return clientX - previousPoint.clientX;
  }

  return clientY - previousPoint.clientY;
}

function getRectCenter(rect, mode) {
  if (mode === "horizontal" || mode === "grid") {
    return rect.left + rect.width / 2;
  }

  return rect.top + rect.height / 2;
}

function getDraggedCenter(rect, mode) {
  if (!rect) return null;

  if (mode === "horizontal" || mode === "grid") {
    return rect.centerX;
  }

  return rect.centerY;
}

function getCenterCrossingReorderTarget({
  clientX,
  clientY,
  group,
  draggedId,
  mode = "vertical",
  dragStart,
  previousPoint,
}) {
  if (typeof document === "undefined") return null;

  const selector = getGroupSelector(group);
  const elements = Array.from(document.querySelectorAll(selector));
  const draggedIndex = elements.findIndex(
    (element) => element.getAttribute("data-reorder-id") === draggedId
  );

  if (draggedIndex === -1) return null;

  const draggedRect = getDraggedMovingRect(dragStart, clientX, clientY);
  const draggedCenter = getDraggedCenter(draggedRect, mode);
  if (draggedCenter === null) return null;

  const movement = getMovementDirection(previousPoint, clientX, clientY, mode);
  if (movement === 0) return null;

  if (movement > 0) {
    const nextElement = elements[draggedIndex + 1];
    if (!nextElement) return null;

    const nextId = nextElement.getAttribute("data-reorder-id");
    const nextRect = nextElement.getBoundingClientRect();
    const nextCenter = getRectCenter(nextRect, mode);

    if (nextId && nextId !== draggedId && draggedCenter >= nextCenter) {
      return {
        element: nextElement,
        targetId: nextId,
        position: "after",
      };
    }
  }

  if (movement < 0) {
    const previousElement = elements[draggedIndex - 1];
    if (!previousElement) return null;

    const previousId = previousElement.getAttribute("data-reorder-id");
    const previousRect = previousElement.getBoundingClientRect();
    const previousCenter = getRectCenter(previousRect, mode);

    if (previousId && previousId !== draggedId && draggedCenter <= previousCenter) {
      return {
        element: previousElement,
        targetId: previousId,
        position: "before",
      };
    }
  }

  return null;
}

export function useReorderDrag({
  id,
  type,
  group,
  disabled = false,
  mode = "vertical",
  liveReorder = true,
  draggedItem,
  setDraggedItem,
  dropTarget,
  setDropTarget,
  getDragPayload,
  canDrop,
  onReorderPreview,
  onDrop,
}) {
  const reorderGroup = group || type || "default";
  const [pointerDragging, setPointerDragging] = useState(false);
  const payloadRef = useRef(null);
  const lastTargetRef = useRef(null);
  const dragStartRef = useRef(null);
  const previousPointRef = useRef(null);
  const callbacksRef = useRef({});

  callbacksRef.current = {
    disabled,
    mode,
    liveReorder,
    setDraggedItem,
    setDropTarget,
    getDragPayload,
    canDrop,
    onReorderPreview,
    onDrop,
  };

  const isDragging = pointerDragging || draggedItem?.id === id;
  const showBeforeLine = !liveReorder && isMatchingDropTarget(dropTarget, id, "before");
  const showAfterLine = !liveReorder && isMatchingDropTarget(dropTarget, id, "after");

  function clearDragState() {
    payloadRef.current = null;
    lastTargetRef.current = null;
    dragStartRef.current = null;
    previousPointRef.current = null;
    setPointerDragging(false);
    setDropTarget?.(null);
    setDraggedItem?.(null);

    if (typeof document !== "undefined") {
      document.body.classList.remove("is-app-dragging");
    }
  }

  function isAllowed(nextDraggedItem = draggedItem) {
    if (disabled) return false;
    if (!nextDraggedItem) return false;
    if (nextDraggedItem.id === id) return false;
    if (typeof canDrop === "function") return canDrop(nextDraggedItem);
    return true;
  }

  function handlePointerDown(event) {
    const current = callbacksRef.current;

    if (current.disabled) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.stopPropagation();

    const payload = typeof current.getDragPayload === "function"
      ? current.getDragPayload()
      : { id };

    if (!payload?.id) return;

    payloadRef.current = payload;
    lastTargetRef.current = null;
    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    };
    previousPointRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    setPointerDragging(true);
    current.setDraggedItem?.(payload);

    if (typeof document !== "undefined") {
      document.body.classList.add("is-app-dragging");
    }

    if (event.currentTarget?.setPointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some embedded browser builds throw if capture is not available.
      }
    }
  }

  function handlePointerMove(event) {
    const current = callbacksRef.current;
    const payload = payloadRef.current;

    if (!payload?.id || current.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    const centerTarget = getCenterCrossingReorderTarget({
      clientX: event.clientX,
      clientY: event.clientY,
      group: reorderGroup,
      draggedId: payload.id,
      mode: current.mode,
      dragStart: dragStartRef.current,
      previousPoint: previousPointRef.current,
    });

    previousPointRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    if (!centerTarget) return;

    const { targetId, position } = centerTarget;
    if (!targetId || targetId === payload.id) return;

    if (typeof current.canDrop === "function" && !current.canDrop(payload)) return;

    const nextDropTarget = { id: targetId, position };
    const previousTarget = lastTargetRef.current;

    const changedTarget =
      previousTarget?.id !== nextDropTarget.id ||
      previousTarget?.position !== nextDropTarget.position;

    if (!changedTarget) return;

    lastTargetRef.current = nextDropTarget;
    current.setDropTarget?.(nextDropTarget);

    if (current.liveReorder && typeof current.onReorderPreview === "function") {
      captureRects(reorderGroup);
      current.onReorderPreview(payload, targetId, position);
      animateAfterStateChange(reorderGroup, payload.id);
    }
  }

  function handlePointerUp(event) {
    const current = callbacksRef.current;
    const payload = payloadRef.current;
    const finalTarget = lastTargetRef.current;

    if (payload?.id && finalTarget?.id && payload.id !== finalTarget.id) {
      current.onDrop?.(payload, finalTarget.id, finalTarget.position);
    }

    event?.stopPropagation?.();
    clearDragState();
  }

  function handlePointerCancel() {
    clearDragState();
  }

  function handleNativeDragStart(event) {
    event.preventDefault();
  }

  useEffect(() => {
    if (!pointerDragging) return undefined;

    const handleWindowPointerMove = (event) => handlePointerMove(event);
    const handleWindowPointerUp = (event) => handlePointerUp(event);
    const handleWindowPointerCancel = () => handlePointerCancel();

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", handleWindowPointerUp, { passive: false });
    window.addEventListener("pointercancel", handleWindowPointerCancel);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerCancel);
    };
  }, [pointerDragging, reorderGroup]);

  return {
    isDragging,
    showBeforeLine,
    showAfterLine,
    clearDragState,
    dragProps: {
      draggable: false,
      "data-reorder-id": id,
      "data-reorder-group": reorderGroup,
      onPointerDown: handlePointerDown,
      onDragStart: handleNativeDragStart,
    },
  };
}
