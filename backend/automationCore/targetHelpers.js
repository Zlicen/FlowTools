function addRuntimeObject(runtime, object) {
  runtime.objects = runtime.objects || [];
  runtime.objects.push(object);
}

function addRuntimeTarget(runtime, target) {
  runtime.targets = runtime.targets || [];
  runtime.targets.push(target);

  // compatibility
  runtime.target = target;
}

function createTrackTarget({
  trackType,
  trackIndex,
  name,
  settings = {},
}) {
  return {
    kind: "track",
    type: "track",
    trackType,
    trackIndex,
    name,
    settings,
    capabilities: ["add", "delete", "rename", "move"],
  };
}

function createTimelineItemTarget({
  item,
  trackType,
  trackIndex,
  name,
  startFrame,
  endFrame,
  durationFrames,
  settings = {},
}) {
  return {
    kind: "timeline-item",
    type: "timeline-item",
    item,
    trackType,
    trackIndex,
    name,
    startFrame,
    endFrame,
    durationFrames,
    settings,
    capabilities: ["delete", "duplicate", "move", "rename"],
  };
}

function createMediaPoolItemTarget({
  item,
  mediaType,
  name,
  filePath,
  settings = {},
}) {
  return {
    kind: "media-pool-item",
    type: "media-pool-item",
    item,
    mediaType,
    name,
    filePath,
    settings,
    capabilities: ["add", "delete", "move", "rename", "import"],
  };
}

module.exports = {
  addRuntimeObject,
  addRuntimeTarget,
  createTrackTarget,
  createTimelineItemTarget,
  createMediaPoolItemTarget,
};