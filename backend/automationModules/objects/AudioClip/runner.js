const { getPlayheadFrame } = require("../../../automationCore/playhead");

function cleanNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function cleanText(value, fallback) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

async function getAudioClipUnderPlayhead(project, timeline, settings) {
  const trackIndex = Math.max(1, cleanNumber(settings.trackIndex, 1));
  const playheadFrame = await getPlayheadFrame(project, timeline);

  const clips = (await timeline.GetItemListInTrack("audio", trackIndex)) || [];

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    if (playheadFrame > start && playheadFrame < end) {
      return clip;
    }
  }

  throw new Error(`No audio clip found under playhead on audio track ${trackIndex}.`);
}

async function getOriginalTimecode(timeline) {
  if (timeline && typeof timeline.GetCurrentTimecode === "function") {
    return timeline.GetCurrentTimecode();
  }

  return null;
}

async function restoreTimecode(timeline, timecode) {
  if (timecode && timeline && typeof timeline.SetCurrentTimecode === "function") {
    await timeline.SetCurrentTimecode(timecode);
  }
}

async function appendToTimeline(project, clipInfo) {
  const mediaPool = await project.GetMediaPool();

  const result = await mediaPool.AppendToTimeline([clipInfo]);

  if (!result) {
    throw new Error("Failed to append audio clip to timeline.");
  }

  return result;
}

async function buildDuplicateClipInfo(clip, trackIndex, recordFrame) {
  const mediaPoolItem = await clip.GetMediaPoolItem();

  if (!mediaPoolItem) {
    throw new Error("Could not find Media Pool item for audio clip.");
  }

  return {
    mediaPoolItem,
    startFrame: Number(await clip.GetSourceStartFrame()),
    endFrame: Number(await clip.GetSourceEndFrame()),
    mediaType: 2,
    trackIndex,
    recordFrame,
  };
}

async function renameClip(clip, settings) {
  if (!clip || typeof clip.SetName !== "function") {
    throw new Error("Resolve API does not support clip.SetName().");
  }

  const name = cleanText(settings.name, "Audio Clip");
  const ok = await clip.SetName(name);

  if (!ok) {
    throw new Error("Failed to rename audio clip.");
  }
}

async function duplicateClip(project, timeline, clip, settings) {
  const originalTimecode = await getOriginalTimecode(timeline);
  const timelineStart = Number(await clip.GetStart());

  const duplicateToTrackIndex = Math.max(
    1,
    cleanNumber(settings.duplicateToTrackIndex, cleanNumber(settings.trackIndex, 1) + 1)
  );

  const clipInfo = await buildDuplicateClipInfo(
    clip,
    duplicateToTrackIndex,
    timelineStart
  );

  await appendToTimeline(project, clipInfo);
  await restoreTimecode(timeline, originalTimecode);
}

async function colorClip(clip, settings) {
  const color = settings.color || "Blue";

  if (color === "Clear Color") {
    await clip.ClearClipColor();
    return;
  }

  const ok = await clip.SetClipColor(color);

  if (!ok) {
    throw new Error(`Failed to set audio clip color: ${color}`);
  }
}

async function deleteClip(timeline, clip) {
  await timeline.DeleteClips([clip], false);
}

async function splitClip(project, timeline, clip, settings) {
  const trackIndex = Math.max(1, cleanNumber(settings.trackIndex, 1));
  const originalTimecode = await getOriginalTimecode(timeline);
  const playheadFrame = await getPlayheadFrame(project, timeline);

  const mediaPoolItem = await clip.GetMediaPoolItem();

  if (!mediaPoolItem) {
    throw new Error("Could not find Media Pool item for audio clip.");
  }

  const timelineStart = Number(await clip.GetStart());
  const timelineEnd = Number(await clip.GetEnd());
  const sourceStart = Number(await clip.GetSourceStartFrame());
  const sourceEnd = Number(await clip.GetSourceEndFrame());

  if (playheadFrame <= timelineStart || playheadFrame >= timelineEnd) {
    throw new Error("Playhead must be inside the audio clip, not on the edge.");
  }

  const splitOffset = playheadFrame - timelineStart;
  const splitSourceFrame = sourceStart + splitOffset;

  await deleteClip(timeline, clip);

  await appendToTimeline(project, {
    mediaPoolItem,
    startFrame: sourceStart,
    endFrame: splitSourceFrame,
    mediaType: 2,
    trackIndex,
    recordFrame: timelineStart,
  });

  await appendToTimeline(project, {
    mediaPoolItem,
    startFrame: splitSourceFrame,
    endFrame: sourceEnd,
    mediaType: 2,
    trackIndex,
    recordFrame: playheadFrame,
  });

  await restoreTimecode(timeline, originalTimecode);
}

async function runAudioClipTargetModule({ project, timeline, module }) {
  if (!timeline) {
    throw new Error("Audio Clip action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "duplicate";
  const clip = await getAudioClipUnderPlayhead(project, timeline, settings);

  if (action === "duplicate") return duplicateClip(project, timeline, clip, settings);
  if (action === "delete") return deleteClip(timeline, clip);
  if (action === "rename") return renameClip(clip, settings);
  if (action === "color") return colorClip(clip, settings);
  if (action === "split") return splitClip(project, timeline, clip, settings);

  throw new Error(`Audio Clip action "${action}" is not implemented.`);
}

module.exports = {
  runAudioClipTargetModule,
};