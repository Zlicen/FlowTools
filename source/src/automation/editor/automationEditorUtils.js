export const MODULE_DRAG_DISTANCE = 6;
export const MIN_LEFT_PANEL_WIDTH = 250;
export const MAX_LEFT_PANEL_WIDTH = 400;
export const MIN_RIGHT_PANEL_WIDTH = 250;
export const MAX_RIGHT_PANEL_WIDTH = 400;
export const MIN_CENTER_PANEL_WIDTH = 520;
export const RESIZER_WIDTH = 12;

export function getDropPositionFromPoint(clientY, element) {
  const rect = element.getBoundingClientRect();
  const y = clientY - rect.top;
  return y < rect.height / 2 ? "before" : "after";
}

export function getModuleKindFromCategory() {
  return "module";
}

export function getCollectionKeyFromKind() {
  return "modules";
}

export function getCategoryDescription(categoryId) {
  if (categoryId === "objects") {
    return "Drag objects into blocks and choose their action in settings.";
  }

  return "Automation modules.";
}

export function reorderBlocks(currentBlocks, draggedBlockId, targetBlockId, position) {
  if (draggedBlockId === targetBlockId) return currentBlocks;

  const nextBlocks = [...currentBlocks];
  const draggedIndex = nextBlocks.findIndex((block) => block.id === draggedBlockId);
  const targetIndex = nextBlocks.findIndex((block) => block.id === targetBlockId);

  if (draggedIndex === -1 || targetIndex === -1) return currentBlocks;

  const [draggedBlock] = nextBlocks.splice(draggedIndex, 1);
  const updatedTargetIndex = nextBlocks.findIndex((block) => block.id === targetBlockId);
  const insertIndex = position === "after" ? updatedTargetIndex + 1 : updatedTargetIndex;

  nextBlocks.splice(insertIndex, 0, draggedBlock);

  return nextBlocks;
}