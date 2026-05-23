const { getPlayheadFrame } = require("../../../automationCore/playhead");

function cleanNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function getAudioClipUnderPlayhead(project, timeline, settings) {
  const trackIndex = Math.max(1, cleanNumber(settings.trackIndex, 1));
  const playheadFrame = await getPlayheadFrame(project, timeline);

  const clips = (await timeline.GetItemListInTrack("audio", trackIndex)) || [];

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    if (playheadFrame >= start && playheadFrame < end) {
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
  await timeline.DeleteClips([clip]);
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
  if (action === "color") return colorClip(clip, settings);

  throw new Error(`Audio Clip action "${action}" is not implemented.`);
}

module.exports = {
  runAudioClipTargetModule,
};