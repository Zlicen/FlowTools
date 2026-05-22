function getTimelineItemName(item) {
  if (!item) return "";

  if (typeof item.GetName === "function") {
    return String(item.GetName() || "");
  }

  if (typeof item.GetClipProperty === "function") {
    const clipName = item.GetClipProperty("Clip Name");
    if (clipName) return String(clipName);
  }

  return "";
}

function getTimelineItemSelected(item) {
  if (!item) return false;

  if (typeof item.GetIsSelected === "function") {
    return Boolean(item.GetIsSelected());
  }

  if (typeof item.GetSelected === "function") {
    return Boolean(item.GetSelected());
  }

  if (typeof item.IsSelected === "function") {
    return Boolean(item.IsSelected());
  }

  return false;
}

function getTimelineItemFrameValue(item, methodName) {
  if (!item || typeof item[methodName] !== "function") return null;

  const value = Number(item[methodName]());

  return Number.isFinite(value) ? value : null;
}

function getTimelineItemStartFrame(item) {
  return getTimelineItemFrameValue(item, "GetStart");
}

function getTimelineItemEndFrame(item) {
  return getTimelineItemFrameValue(item, "GetEnd");
}

function getTimelineItemDurationFrames(item) {
  const startFrame = getTimelineItemStartFrame(item);
  const endFrame = getTimelineItemEndFrame(item);

  if (startFrame === null || endFrame === null) {
    return null;
  }

  return endFrame - startFrame;
}

async function getItemsInTrack(timeline, trackType, trackIndex) {
  const items = await timeline.GetItemListInTrack(trackType, trackIndex);

  if (!items) return [];

  if (Array.isArray(items)) {
    return items.filter(Boolean);
  }

  if (typeof items === "object") {
    return Object.values(items).filter(Boolean);
  }

  return [];
}

function findTimelineItemsByName(items, clipName) {
  const cleanName = String(clipName || "").trim();

  if (!cleanName) {
    return [];
  }

  return items.filter((item) => getTimelineItemName(item) === cleanName);
}

function findSelectedTimelineItems(items) {
  return items.filter(getTimelineItemSelected);
}

module.exports = {
  getTimelineItemName,
  getTimelineItemSelected,
  getTimelineItemStartFrame,
  getTimelineItemEndFrame,
  getTimelineItemDurationFrames,
  getItemsInTrack,
  findTimelineItemsByName,
  findSelectedTimelineItems,
};