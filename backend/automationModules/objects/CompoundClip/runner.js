const { getPlayheadFrame } = require("../../../automationCore/playhead");

function cleanText(value, fallback) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

function parseTrackList(value, fallbackTrack = 1) {
  const raw = String(value ?? "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((number) => Number.isFinite(number) && number >= 1)
    .map((number) => Math.floor(number));

  const unique = [...new Set(raw)];

  return unique.length > 0 ? unique : [fallbackTrack];
}

async function getClipsUnderPlayheadInTrack(timeline, trackType, trackIndex, playheadFrame) {
  const clips = (await timeline.GetItemListInTrack(trackType, trackIndex)) || [];
  const found = [];

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    if (playheadFrame >= start && playheadFrame < end) {
      found.push(clip);
    }
  }

  return found;
}

async function getTargetClipsUnderPlayhead(project, timeline, settings) {
  const playheadFrame = await getPlayheadFrame(project, timeline);
  const sourceMode = settings.sourceMode || "both";

  const targetClips = [];

  if (sourceMode === "both" || sourceMode === "video") {
    const videoTracks = parseTrackList(settings.videoTracks, 1);

    for (const trackIndex of videoTracks) {
      const clips = await getClipsUnderPlayheadInTrack(
        timeline,
        "video",
        trackIndex,
        playheadFrame
      );

      targetClips.push(...clips);
    }
  }

  if (sourceMode === "both" || sourceMode === "audio") {
    const audioTracks = parseTrackList(settings.audioTracks, 1);

    for (const trackIndex of audioTracks) {
      const clips = await getClipsUnderPlayheadInTrack(
        timeline,
        "audio",
        trackIndex,
        playheadFrame
      );

      targetClips.push(...clips);
    }
  }

  if (targetClips.length === 0) {
    throw new Error("No clips found under playhead for the selected tracks.");
  }

  return targetClips;
}

async function createCompoundClip(project, timeline, settings) {
  if (!timeline || typeof timeline.CreateCompoundClip !== "function") {
    throw new Error("Resolve API does not support Timeline.CreateCompoundClip().");
  }

  const clips = await getTargetClipsUnderPlayhead(project, timeline, settings);
  const name = cleanText(settings.name, "Compound Clip");

  const result = await timeline.CreateCompoundClip(clips, {
    name,
    startTimecode: "00:00:00:00",
  });

  if (!result) {
    throw new Error("Failed to create compound clip.");
  }

  return result;
}

async function renameCompoundClip(project, timeline, settings) {
  const clips = await getTargetClipsUnderPlayhead(project, timeline, settings);
  const name = cleanText(settings.name, "Compound Clip");

  let renamedCount = 0;

  for (const clip of clips) {
    if (typeof clip.SetName === "function") {
      const ok = await clip.SetName(name);

      if (ok) {
        renamedCount += 1;
      }
    }
  }

  if (renamedCount === 0) {
    throw new Error("No compound clip could be renamed.");
  }

  return {
    success: true,
    renamedCount,
  };
}

async function deleteCompoundClip(project, timeline, settings) {
  const clips = await getTargetClipsUnderPlayhead(project, timeline, settings);

  if (!timeline || typeof timeline.DeleteClips !== "function") {
    throw new Error("Resolve API does not support Timeline.DeleteClips().");
  }

  await timeline.DeleteClips(clips);

  return {
    success: true,
    deletedCount: clips.length,
  };
}

async function runCompoundClipTargetModule({ project, timeline, module }) {
  if (!timeline) {
    throw new Error("Compound Clip action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "create";

  if (action === "create") return createCompoundClip(project, timeline, settings);
  if (action === "rename") return renameCompoundClip(project, timeline, settings);
  if (action === "delete") return deleteCompoundClip(project, timeline, settings);

  throw new Error(`Compound Clip action "${action}" is not implemented.`);
}

module.exports = {
  runCompoundClipTargetModule,
};