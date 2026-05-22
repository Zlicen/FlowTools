function parseTimecodeToFrames(timecode, frameRate) {
  const parts = String(timecode || "").split(":").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [hours, minutes, seconds, frames] = parts;

  return (
    hours * 60 * 60 * frameRate +
    minutes * 60 * frameRate +
    seconds * frameRate +
    frames
  );
}

async function getTimelineFrameRate(project) {
  const value = Number(await project.GetSetting("timelineFrameRate"));

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return 24;
}

async function getTimelineStartFrame(timeline) {
  if (timeline && typeof timeline.GetStartFrame === "function") {
    const value = Number(await timeline.GetStartFrame());

    if (Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

async function getPlayheadFrame(project, timeline) {
  if (!timeline || typeof timeline.GetCurrentTimecode !== "function") {
    throw new Error("Could not read the current playhead timecode.");
  }

  const timecode = await timeline.GetCurrentTimecode();
  const frameRate = await getTimelineFrameRate(project);
  const frameFromTimecode = parseTimecodeToFrames(timecode, frameRate);

  if (frameFromTimecode === null) {
    throw new Error(`Could not parse playhead timecode: ${timecode}`);
  }

  return frameFromTimecode - (await getTimelineStartFrame(timeline));
}

module.exports = {
  getPlayheadFrame,
};