function pad(number, size = 2) {
  return String(number).padStart(size, "0");
}

async function getTimelineFrameRate(project, timeline) {
  if (timeline && typeof timeline.GetSetting === "function") {
    const timelineFrameRate =
      await timeline.GetSetting("timelineFrameRate");

    if (timelineFrameRate) {
      return Number(timelineFrameRate);
    }
  }

  if (project && typeof project.GetSetting === "function") {
    const projectFrameRate =
      await project.GetSetting("timelineFrameRate");

    if (projectFrameRate) {
      return Number(projectFrameRate);
    }
  }

  return 24;
}

async function frameToTimecode(project, timeline, frame) {
  const fps = await getTimelineFrameRate(project, timeline);
  const cleanFrame = Math.max(0, Number(frame || 0));

  const hours = Math.floor(cleanFrame / (fps * 60 * 60));
  const minutes = Math.floor((cleanFrame / (fps * 60)) % 60);
  const seconds = Math.floor((cleanFrame / fps) % 60);
  const frames = Math.floor(cleanFrame % fps);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

module.exports = {
  frameToTimecode,
  getTimelineFrameRate,
};