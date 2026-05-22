export function getVerticalDropPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  return y < rect.height / 2 ? "before" : "after";
}

export function getGridDropPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  return x < rect.width / 2 ? "before" : "after";
}

export function isMatchingDropTarget(dropTarget, id, position) {
  return dropTarget?.id === id && dropTarget?.position === position;
}
