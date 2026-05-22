async function deleteTrack(timeline, target) {
  const result = await timeline.DeleteTrack(target.trackType, target.trackIndex);

  if (result === false) {
    throw new Error(
      `Failed to delete ${target.trackType} track ${target.trackIndex}.`
    );
  }
}

async function deleteTimelineItems(timeline, targets) {
  const timelineItems = targets.map((target) => target.item).filter(Boolean);

  if (timelineItems.length === 0) {
    throw new Error("No timeline items were found to delete.");
  }

  const result = await timeline.DeleteClips(timelineItems, false);

  if (result === false) {
    throw new Error("Failed to delete one or more timeline clips.");
  }
}

async function deleteTargets(timeline, targets) {
  const timelineItemTargets = targets.filter(
    (target) => target.kind === "timeline-item"
  );

  if (timelineItemTargets.length > 0) {
    await deleteTimelineItems(timeline, timelineItemTargets);
  }

  const trackTargets = targets.filter((target) => target.kind === "track");

  for (let index = trackTargets.length - 1; index >= 0; index -= 1) {
    await deleteTrack(timeline, trackTargets[index]);
  }
}

module.exports = {
  deleteTrack,
  deleteTimelineItems,
  deleteTargets,
};