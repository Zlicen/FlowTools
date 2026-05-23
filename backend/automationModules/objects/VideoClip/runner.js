const { getPlayheadFrame } = require("../../../automationCore/playhead");

function cleanNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function getVideoClipUnderPlayhead(project, timeline, settings) {
  const trackIndex = Math.max(1, cleanNumber(settings.trackIndex, 1));
  const playheadFrame = await getPlayheadFrame(project, timeline);

  if (!timeline || typeof timeline.GetItemListInTrack !== "function") {
    throw new Error("Resolve API does not support GetItemListInTrack.");
  }

  const clips = (await timeline.GetItemListInTrack("video", trackIndex)) || [];

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    if (playheadFrame >= start && playheadFrame < end) {
      return clip;
    }
  }

  throw new Error(
    `No video clip found under playhead on video track ${trackIndex}.`
  );
}

async function setClipProperty(clip, propertyName, value, fallback) {
  if (!clip || typeof clip.SetProperty !== "function") {
    throw new Error("Resolve API does not support SetProperty on video clips.");
  }

  const cleanValue = cleanNumber(value, fallback);

  const ok = await clip.SetProperty(propertyName, cleanValue);

  if (!ok) {
    throw new Error(`Failed setting ${propertyName} to ${cleanValue}.`);
  }
}

async function transformClip(clip, settings) {
  await setClipProperty(clip, "ZoomX", settings.zoomX, 1);
  await setClipProperty(clip, "ZoomY", settings.zoomY, 1);

  await setClipProperty(clip, "PositionX", settings.positionX, 0);
  await setClipProperty(clip, "PositionY", settings.positionY, 0);

  await setClipProperty(clip, "RotationAngle", settings.rotationAngle, 0);
}

async function cropClip(clip, settings) {
  await setClipProperty(clip, "CropLeft", settings.cropLeft, 0);
  await setClipProperty(clip, "CropRight", settings.cropRight, 0);
  await setClipProperty(clip, "CropTop", settings.cropTop, 0);
  await setClipProperty(clip, "CropBottom", settings.cropBottom, 0);
  await setClipProperty(clip, "CropSoftness", settings.cropSoftness, 0);
}

async function opacityClip(clip, settings) {
  await setClipProperty(clip, "Opacity", settings.opacity, 100);
}

async function speedClip(clip, settings) {
  await setClipProperty(clip, "Speed", settings.speed, 100);
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

async function duplicateClip(timeline, clip) {
  if (!timeline || typeof timeline.DuplicateClips !== "function") {
    throw new Error("Resolve API does not support DuplicateClips.");
  }

  const ok = await timeline.DuplicateClips([clip]);

  if (!ok) {
    throw new Error("Failed to duplicate video clip.");
  }
}

async function deleteClip(timeline, clip) {
  if (!timeline || typeof timeline.DeleteClips !== "function") {
    throw new Error("Resolve API does not support DeleteClips.");
  }

  const ok = await timeline.DeleteClips([clip]);

  if (!ok) {
    throw new Error("Failed to delete video clip.");
  }
}

async function moveClip(timeline, clip, settings) {
  if (!timeline || typeof timeline.MoveClips !== "function") {
    throw new Error("Resolve API does not support MoveClips.");
  }

  const start = Number(await clip.GetStart());
  const targetTrackIndex = Math.max(1, cleanNumber(settings.targetTrackIndex, 1));
  const offsetFrames = cleanNumber(settings.offsetFrames, 0);
  const targetFrame = start + offsetFrames;

  const ok = await timeline.MoveClips([clip], targetFrame, targetTrackIndex);

  if (!ok) {
    throw new Error("Failed to move video clip.");
  }
}

async function runVideoClipTargetModule({ project, timeline, module }) {
  if (!timeline) {
    throw new Error("Video Clip action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "transform";

  const clip = await getVideoClipUnderPlayhead(project, timeline, settings);

  if (action === "transform") {
    await transformClip(clip, settings);
    return;
  }

  if (action === "crop") {
    await cropClip(clip, settings);
    return;
  }

  if (action === "opacity") {
    await opacityClip(clip, settings);
    return;
  }

  if (action === "speed") {
    await speedClip(clip, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateClip(timeline, clip);
    return;
  }

  if (action === "delete") {
    await deleteClip(timeline, clip);
    return;
  }

  if (action === "move") {
    await moveClip(timeline, clip, settings);
    return;
  }

  if (action === "color") {
    await colorClip(clip, settings);
    return;
  }

  throw new Error(`Video Clip action "${action}" is not implemented.`);
}

module.exports = {
  runVideoClipTargetModule,
};