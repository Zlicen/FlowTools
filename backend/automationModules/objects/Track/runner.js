function normalizeTrackType(value) {
  if (value === "audio") return "audio";
  if (value === "subtitle") return "subtitle";
  return "video";
}

async function setTrack(timeline, settings) {
  if (!timeline) {
    throw new Error("Track Set needs an active timeline.");
  }

  if (typeof timeline.AddTrack !== "function") {
    throw new Error("Resolve API does not support AddTrack.");
  }

  const trackType = normalizeTrackType(settings.trackType);

  const ok = await timeline.AddTrack(trackType);

  if (!ok) {
    throw new Error(`Failed to create ${trackType} track.`);
  }

  if (settings.name) {
    console.log(`Track name requested but not implemented yet: ${settings.name}`);
  }

  if (settings.color && settings.color !== "default") {
    console.log(`Track color requested but not implemented yet: ${settings.color}`);
  }
}

async function deleteTrack(timeline, settings) {
  if (!timeline) {
    throw new Error("Track Delete needs an active timeline.");
  }

  if (typeof timeline.DeleteTrack !== "function") {
    throw new Error("Resolve API does not support DeleteTrack.");
  }

  const trackType = normalizeTrackType(settings.trackType);
  const trackIndex = Math.max(1, Number(settings.trackIndex || 1));

  const ok = await timeline.DeleteTrack(trackType, trackIndex);

  if (!ok) {
    throw new Error(`Failed to delete ${trackType} track ${trackIndex}.`);
  }
}

async function renameTrack(timeline, settings) {
  if (!timeline) {
    throw new Error("Track Rename needs an active timeline.");
  }

  if (typeof timeline.SetTrackName !== "function") {
    throw new Error("Resolve API does not support SetTrackName.");
  }

  const trackType = normalizeTrackType(settings.trackType);
  const trackIndex = Math.max(1, Number(settings.trackIndex || 1));
  const name = String(settings.name || "").trim();

  if (!name) {
    throw new Error("Track Rename needs a name.");
  }

  const ok = await timeline.SetTrackName(trackType, trackIndex, name);

  if (!ok) {
    throw new Error(`Failed to rename ${trackType} track ${trackIndex}.`);
  }
}

async function runTrackTargetModule({ timeline, module }) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setTrack(timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteTrack(timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameTrack(timeline, settings);
    return;
  }

  throw new Error(`Track action "${action}" is not implemented yet.`);
}

module.exports = {
  runTrackTargetModule,
};