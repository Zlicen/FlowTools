const {
  getPlayheadFrame,
} = require("../../../automationCore/playhead");

const {
  frameToTimecode,
} = require("../../../automationCore/timecode");

const {
  getTrackCount,
} = require("../../../automationCore/tracks");

const {
  getItemsInTrack,
  getTimelineItemStartFrame,
  getTimelineItemEndFrame,
} = require("../../../automationCore/timelineItems");

function normalizeTrackType(value) {
  if (value === "audio") return "audio";
  return "video";
}

async function moveToTimecode(timeline, settings) {
  if (typeof timeline.SetCurrentTimecode !== "function") {
    throw new Error("Resolve API does not support SetCurrentTimecode.");
  }

  const timecode = String(settings.timecode || "").trim();

  if (!timecode) {
    throw new Error("Playhead Move needs a timecode.");
  }

  const ok = await timeline.SetCurrentTimecode(timecode);

  if (!ok) {
    throw new Error("Failed to move playhead to timecode.");
  }
}

async function moveToFrame(project, timeline, frame) {
  if (typeof timeline.SetCurrentTimecode !== "function") {
    throw new Error("Resolve API does not support SetCurrentTimecode.");
  }

  const timecode = await frameToTimecode(project, timeline, frame);
  const ok = await timeline.SetCurrentTimecode(timecode);

  if (!ok) {
    throw new Error(`Failed to move playhead to frame ${frame}.`);
  }
}

async function getCandidateClipsFromTrack(timeline, trackType, trackIndex) {
  const items = await getItemsInTrack(timeline, trackType, trackIndex);

  return items
    .map((item) => ({
      item,
      startFrame: getTimelineItemStartFrame(item),
      endFrame: getTimelineItemEndFrame(item),
      trackType,
      trackIndex,
    }))
    .filter(
      (candidate) =>
        candidate.startFrame !== null &&
        candidate.endFrame !== null
    );
}

async function getCandidateClips(timeline, settings) {
  const trackTypeSetting = settings.trackType || "any";

  if (trackTypeSetting !== "any") {
    const trackType = normalizeTrackType(trackTypeSetting);
    const trackIndex = Math.max(1, Number(settings.trackIndex || 1));

    return await getCandidateClipsFromTrack(timeline, trackType, trackIndex);
  }

  const results = [];

  for (const trackType of ["video", "audio"]) {
    const count = await getTrackCount(timeline, trackType);

    for (let index = 1; index <= count; index += 1) {
      const clips = await getCandidateClipsFromTrack(timeline, trackType, index);
      results.push(...clips);
    }
  }

  return results;
}

async function moveToClip(project, timeline, settings) {
  const currentFrame = await getPlayheadFrame(project, timeline);
  const candidates = await getCandidateClips(timeline, settings);
  const moveTo = settings.moveTo || "nextClip";

  let target = null;

  if (moveTo === "nextClip") {
    target = candidates
      .filter((clip) => clip.startFrame > currentFrame)
      .sort((a, b) => a.startFrame - b.startFrame)[0];
  }

  if (moveTo === "previousClip") {
    target = candidates
      .filter((clip) => clip.startFrame < currentFrame)
      .sort((a, b) => b.startFrame - a.startFrame)[0];
  }

  if (!target) {
    throw new Error("No matching clip found.");
  }

  await moveToFrame(project, timeline, target.startFrame);
}

async function movePlayhead(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Playhead Move needs an active timeline.");
  }

  const moveTo = settings.moveTo || "timecode";

  if (moveTo === "timecode") {
    await moveToTimecode(timeline, settings);
    return;
  }

  if (moveTo === "frame") {
    await moveToFrame(project, timeline, Math.max(0, Number(settings.frame || 0)));
    return;
  }

  if (moveTo === "framesFromCurrent") {
  await moveFramesFromCurrent(project, timeline, settings);
  return;
}

  if (moveTo === "nextClip" || moveTo === "previousClip") {
    await moveToClip(project, timeline, settings);
    return;
  }

  throw new Error(`Playhead Move target "${moveTo}" is not implemented.`);
}

async function moveFramesFromCurrent(project, timeline, settings) {
  const currentFrame = await getPlayheadFrame(project, timeline);
  const amount = Math.max(1, Number(settings.frames || 1));
  const direction = settings.direction || "forward";

  const targetFrame =
    direction === "backward"
      ? Math.max(0, currentFrame - amount)
      : currentFrame + amount;

  await moveToFrame(project, timeline, targetFrame);
}

async function runPlayheadTargetModule({
  project,
  timeline,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "move";

  if (action === "move") {
    await movePlayhead(project, timeline, settings);
    return;
  }

  throw new Error(`Playhead action "${action}" is not implemented.`);
}

module.exports = {
  runPlayheadTargetModule,
};