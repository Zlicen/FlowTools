const {
  getTimelineItemName,
  getTimelineItemStartFrame,
  getTimelineItemEndFrame,
  getItemsInTrack,
} = require("../../../automationCore/timelineItems");

const { getTrackCount } = require("../../../automationCore/tracks");
const { getPlayheadFrame } = require("../../../automationCore/playhead");

const TRACK_TYPES = ["video", "audio", "subtitle"];

function normalizeTrackType(value) {
  if (value === "audio") return "audio";
  if (value === "subtitle") return "subtitle";
  return "video";
}

function itemIsOverPlayhead(item, playheadFrame) {
  const startFrame = getTimelineItemStartFrame(item);
  const endFrame = getTimelineItemEndFrame(item);

  if (startFrame === null || endFrame === null) return false;

  return startFrame <= playheadFrame && playheadFrame < endFrame;
}

async function getItemsFromTrack(timeline, trackType, trackIndex) {
  return await getItemsInTrack(timeline, trackType, trackIndex);
}

async function getItemsFromAllTracks(timeline) {
  const results = [];

  for (const trackType of TRACK_TYPES) {
    const trackCount = await getTrackCount(timeline, trackType);

    for (let trackIndex = 1; trackIndex <= trackCount; trackIndex += 1) {
      const items = await getItemsFromTrack(timeline, trackType, trackIndex);

      for (const item of items) {
        results.push({
          item,
          trackType,
          trackIndex,
        });
      }
    }
  }

  return results;
}

async function findTimelineItems(project, timeline, settings) {
  const findMode = settings.findMode || "playhead";

  if (findMode === "track") {
    const trackType = normalizeTrackType(settings.trackType);
    const trackIndex = Math.max(1, Number(settings.trackIndex || 1));
    const items = await getItemsFromTrack(timeline, trackType, trackIndex);

    return items.map((item) => ({
      item,
      trackType,
      trackIndex,
    }));
  }

  const allItems = await getItemsFromAllTracks(timeline);

  if (findMode === "name") {
    const name = String(settings.name || "").toLowerCase();

    return allItems.filter(({ item }) =>
      String(getTimelineItemName(item) || "")
        .toLowerCase()
        .includes(name)
    );
  }

  const playheadFrame = await getPlayheadFrame(project, timeline);

  return allItems.filter(({ item }) =>
    itemIsOverPlayhead(item, playheadFrame)
  );
}

async function deleteTimelineItems(project, timeline, settings) {
  const items = await findTimelineItems(project, timeline, settings);

  if (items.length === 0) {
    throw new Error("Timeline Items Delete found no matching items.");
  }

  for (const { item } of items) {
    if (typeof item.Delete !== "function") {
      throw new Error("Resolve API does not support deleting this timeline item.");
    }

    const ok = await item.Delete();

    if (!ok) {
      throw new Error("Failed to delete timeline item.");
    }
  }
}

async function renameTimelineItems(project, timeline, settings) {
  throw new Error("Timeline Items Rename is not implemented yet.");
}

async function moveTimelineItems(project, timeline, settings) {
  throw new Error("Timeline Items Move is not implemented yet.");
}

async function duplicateTimelineItems(project, timeline, settings) {
  throw new Error("Timeline Items Duplicate is not implemented yet.");
}

async function setTimelineItems() {
  throw new Error("Timeline Items Set is not implemented yet.");
}

async function runTimelineMediaTargetModule({
  project,
  timeline,
  module,
}) {
  if (!timeline) {
    throw new Error("Timeline Items needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setTimelineItems(project, timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteTimelineItems(project, timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameTimelineItems(project, timeline, settings);
    return;
  }

  if (action === "move") {
    await moveTimelineItems(project, timeline, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateTimelineItems(project, timeline, settings);
    return;
  }

  throw new Error(`Timeline Items action "${action}" is not implemented.`);
}

module.exports = {
  runTimelineMediaTargetModule,
};