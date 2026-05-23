const { getPlayheadFrame } = require("../../../automationCore/playhead");

function cleanNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function getVideoClipUnderPlayhead(project, timeline, settings) {
  const trackIndex = Math.max(1, cleanNumber(settings.trackIndex, 1));
  const playheadFrame = await getPlayheadFrame(project, timeline);

  const clips = (await timeline.GetItemListInTrack("video", trackIndex)) || [];

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    if (playheadFrame >= start && playheadFrame < end) {
      return clip;
    }
  }

  throw new Error(`No video clip found under playhead on video track ${trackIndex}.`);
}

async function setProperty(clip, names, value, fallback) {
  const cleanValue = cleanNumber(value, fallback);

  for (const name of names) {
    try {
      const ok = await clip.SetProperty(name, cleanValue);
      if (ok) return;
    } catch (_) {}
  }

  throw new Error(`Failed setting property. Tried: ${names.join(", ")} = ${cleanValue}`);
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

  if (!mediaPool || typeof mediaPool.AppendToTimeline !== "function") {
    throw new Error("Resolve API does not support MediaPool.AppendToTimeline().");
  }

  const result = await mediaPool.AppendToTimeline([clipInfo]);

  if (!result) {
    throw new Error("Failed to append clip to timeline.");
  }

  return result;
}

async function buildDuplicateClipInfo(clip, trackIndex, recordFrame) {
  const mediaPoolItem = await clip.GetMediaPoolItem();

  if (!mediaPoolItem) {
    throw new Error("Could not find Media Pool item for video clip.");
  }

  const sourceStart = Number(await clip.GetSourceStartFrame());
  const sourceEnd = Number(await clip.GetSourceEndFrame());

  if (!Number.isFinite(sourceStart) || !Number.isFinite(sourceEnd)) {
    throw new Error(`Invalid source frames: start=${sourceStart}, end=${sourceEnd}`);
  }

  return {
    mediaPoolItem,
    startFrame: sourceStart,
    endFrame: sourceEnd,
    mediaType: 1,
    trackIndex,
    recordFrame,
  };
}

async function positionClip(clip, settings) {
  await setProperty(clip, ["Pan", "PositionX"], settings.positionX, 0);
  await setProperty(clip, ["Tilt", "PositionY"], settings.positionY, 0);
}

async function zoomClip(clip, settings) {
  const zoom = cleanNumber(settings.zoom, 1);

  await setProperty(clip, ["ZoomX"], zoom, 1);
  await setProperty(clip, ["ZoomY"], zoom, 1);
}

async function rotationClip(clip, settings) {
  await setProperty(
    clip,
    ["RotationAngle", "Rotation"],
    settings.rotationAngle,
    0
  );
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

async function cropClip(clip, settings) {
  await setProperty(clip, ["CropLeft"], settings.cropLeft, 0);
  await setProperty(clip, ["CropRight"], settings.cropRight, 0);
  await setProperty(clip, ["CropTop"], settings.cropTop, 0);
  await setProperty(clip, ["CropBottom"], settings.cropBottom, 0);
  await setProperty(clip, ["CropSoftness"], settings.cropSoftness, 0);
}

async function opacityClip(clip, settings) {
  await setProperty(clip, ["Opacity"], settings.opacity, 100);
}

async function colorClip(clip, settings) {
  if (!clip || typeof clip.SetClipColor !== "function") {
    throw new Error("Resolve API does not support SetClipColor.");
  }

  const ok = await clip.SetClipColor(settings.color || "Blue");

  if (!ok) {
    throw new Error("Failed to set clip color.");
  }
}

async function deleteClip(timeline, clip) {
  if (!timeline || typeof timeline.DeleteClips !== "function") {
    throw new Error("Resolve API does not support DeleteClips.");
  }

  await timeline.DeleteClips([clip]);
}

async function runVideoClipTargetModule({ project, timeline, module }) {
  if (!timeline) {
    throw new Error("Video Clip action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "zoom";

  const clip = await getVideoClipUnderPlayhead(project, timeline, settings);

  if (action === "position") return positionClip(clip, settings);
  if (action === "zoom") return zoomClip(clip, settings);
  if (action === "rotation") return rotationClip(clip, settings);
  if (action === "duplicate") return duplicateClip(project, timeline, clip, settings);
  if (action === "crop") return cropClip(clip, settings);
  if (action === "opacity") return opacityClip(clip, settings);
  if (action === "delete") return deleteClip(timeline, clip);
  if (action === "color") return colorClip(clip, settings);

  throw new Error(`Video Clip action "${action}" is not implemented.`);
}

module.exports = {
  runVideoClipTargetModule,
};