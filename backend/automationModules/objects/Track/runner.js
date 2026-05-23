function normalizeTrackType(value) {
  if (value === "audio") return "audio";
  return "video";
}

async function getTrackCount(timeline, trackType) {
  if (!timeline || typeof timeline.GetTrackCount !== "function") {
    throw new Error("Resolve API does not support GetTrackCount.");
  }

  return Number((await timeline.GetTrackCount(trackType)) || 0);
}

async function getTrackName(timeline, trackType, trackIndex) {
  if (!timeline || typeof timeline.GetTrackName !== "function") {
    return "";
  }

  return String((await timeline.GetTrackName(trackType, trackIndex)) || "");
}

async function findTrackIndex(timeline, settings) {
  const trackType = normalizeTrackType(settings.trackType);
  const findBy = settings.findBy || "index";

  if (findBy === "index") {
    return Math.max(1, Number(settings.trackIndex || 1));
  }

  const wantedName = String(settings.trackName || "").trim();

  if (!wantedName) {
    throw new Error("Track name is required.");
  }

  const trackCount = await getTrackCount(timeline, trackType);

  for (let index = 1; index <= trackCount; index += 1) {
    const name = await getTrackName(timeline, trackType, index);

    if (name === wantedName) {
      return index;
    }
  }

  throw new Error(`Track "${wantedName}" was not found.`);
}

async function ensureTrackExists(timeline, trackType, trackIndex) {
  let trackCount = await getTrackCount(timeline, trackType);

  while (trackCount < trackIndex) {
    if (typeof timeline.AddTrack !== "function") {
      throw new Error("Resolve API does not support AddTrack.");
    }

    const ok = await timeline.AddTrack(trackType);

    if (!ok) {
      throw new Error(`Failed to create ${trackType} track ${trackCount + 1}.`);
    }

    trackCount = await getTrackCount(timeline, trackType);
  }
}

async function setTrackName(timeline, trackType, trackIndex, name) {
  const cleanName = String(name || "").trim();

  if (!cleanName) return;

  if (typeof timeline.SetTrackName !== "function") {
    throw new Error("Resolve API does not support SetTrackName.");
  }

  const ok = await timeline.SetTrackName(trackType, trackIndex, cleanName);

  if (!ok) {
    throw new Error(`Failed to set ${trackType} track ${trackIndex} name.`);
  }
}

async function addTrack(timeline, settings) {
  const trackType = normalizeTrackType(settings.trackType);
  const trackIndex = Math.max(1, Number(settings.trackIndex || 1));

  await ensureTrackExists(timeline, trackType, trackIndex);
  await setTrackName(timeline, trackType, trackIndex, settings.name);
}

async function renameTrack(timeline, settings) {
  const trackType = normalizeTrackType(settings.trackType);
  const trackIndex = await findTrackIndex(timeline, settings);
  const newName = String(settings.newName || "").trim();

  if (!newName) {
    throw new Error("Track Rename needs a new name.");
  }

  await setTrackName(timeline, trackType, trackIndex, newName);
}

async function deleteTrack(timeline, settings) {
  if (typeof timeline.DeleteTrack !== "function") {
    throw new Error("Resolve API does not support DeleteTrack.");
  }

  const trackType = normalizeTrackType(settings.trackType);
  const trackIndex = await findTrackIndex(timeline, settings);

  const ok = await timeline.DeleteTrack(trackType, trackIndex);

  if (!ok) {
    throw new Error(`Failed to delete ${trackType} track ${trackIndex}.`);
  }
}

async function duplicateTrack(timeline, settings) {
  const trackType = normalizeTrackType(settings.trackType);
  const sourceIndex = await findTrackIndex(timeline, settings);
  const duplicateToIndex = Math.max(1, Number(settings.duplicateToIndex || 1));
  const sourceName = await getTrackName(timeline, trackType, sourceIndex);

  if (typeof timeline.AddTrack !== "function") {
    throw new Error("Resolve API does not support AddTrack.");
  }

  const ok = await timeline.AddTrack(trackType);

  if (!ok) {
    throw new Error(`Failed to duplicate ${trackType} track ${sourceIndex}.`);
  }

  const newTrackIndex = await getTrackCount(timeline, trackType);

  if (sourceName) {
    await setTrackName(timeline, trackType, newTrackIndex, `${sourceName} Copy`);
  }

  if (duplicateToIndex !== newTrackIndex) {
    if (typeof timeline.MoveTrack !== "function") {
      throw new Error("Resolve API does not support MoveTrack.");
    }

    const moveOk = await timeline.MoveTrack(
      trackType,
      newTrackIndex,
      duplicateToIndex
    );

    if (!moveOk) {
      throw new Error(
        `Failed to move duplicated ${trackType} track to index ${duplicateToIndex}.`
      );
    }
  }
}

async function runTrackTargetModule({ timeline, module }) {
  if (!timeline) {
    throw new Error("Track action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "add";

  if (action === "add") {
    await addTrack(timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameTrack(timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteTrack(timeline, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateTrack(timeline, settings);
    return;
  }

  throw new Error(`Track action "${action}" is not implemented.`);
}

module.exports = {
  runTrackTargetModule,
};