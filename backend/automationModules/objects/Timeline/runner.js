async function getTimelineName(timeline) {
  if (!timeline || typeof timeline.GetName !== "function") {
    return "";
  }

  return String((await timeline.GetName()) || "");
}

async function getTimelineByName(project, timelineName) {
  if (!project) {
    throw new Error("Timeline action needs an active project.");
  }

  const wantedName = String(timelineName || "").trim();

  if (!wantedName) {
    throw new Error("Timeline name is required.");
  }

  if (typeof project.GetTimelineCount !== "function") {
    throw new Error("Resolve API does not support GetTimelineCount.");
  }

  if (typeof project.GetTimelineByIndex !== "function") {
    throw new Error("Resolve API does not support GetTimelineByIndex.");
  }

  const timelineCount = await project.GetTimelineCount();

  for (let index = 1; index <= timelineCount; index += 1) {
    const timeline = await project.GetTimelineByIndex(index);
    const name = await getTimelineName(timeline);

    if (name === wantedName) {
      return timeline;
    }
  }

  throw new Error(`Timeline "${wantedName}" was not found.`);
}

async function findTimeline(project, currentTimeline, settings) {
  const findBy = settings.findBy || "current";

  if (findBy === "name") {
    return await getTimelineByName(project, settings.timelineName);
  }

  if (!currentTimeline) {
    throw new Error("No current timeline found.");
  }

  return currentTimeline;
}

async function duplicateTimeline(project, currentTimeline, settings) {
  const timeline = await findTimeline(project, currentTimeline, settings);
  const name = String(settings.name || "").trim();

  if (!name) {
    throw new Error("Duplicate Timeline needs a name.");
  }

  if (typeof timeline.DuplicateTimeline !== "function") {
    throw new Error("Resolve API does not support DuplicateTimeline.");
  }

  const duplicatedTimeline = await timeline.DuplicateTimeline(name);

  if (!duplicatedTimeline) {
    throw new Error("Failed to duplicate timeline.");
  }
}

async function renameTimeline(project, currentTimeline, settings) {
  const timeline = await findTimeline(project, currentTimeline, settings);
  const newName = String(settings.newName || "").trim();

  if (!newName) {
    throw new Error("Rename Timeline needs a new name.");
  }

  if (typeof timeline.SetName !== "function") {
    throw new Error("Resolve API does not support timeline SetName.");
  }

  const ok = await timeline.SetName(newName);

  if (!ok) {
    throw new Error("Failed to rename timeline.");
  }
}

async function deleteTimeline(project, currentTimeline, settings) {
  const timeline = await findTimeline(project, currentTimeline, settings);
  const timelineName = await getTimelineName(timeline);

  if (!project || typeof project.GetMediaPool !== "function") {
    throw new Error("Resolve API does not support GetMediaPool.");
  }

  const mediaPool = await project.GetMediaPool();

  if (!mediaPool || typeof mediaPool.DeleteTimelines !== "function") {
    throw new Error("Resolve API does not support DeleteTimelines.");
  }

  const ok = await mediaPool.DeleteTimelines([timeline]);

  if (!ok) {
    throw new Error(`Failed to delete timeline "${timelineName}".`);
  }
}

async function runTimelineTargetModule({
  project,
  timeline,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "duplicate";

  if (action === "duplicate") {
    await duplicateTimeline(project, timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameTimeline(project, timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteTimeline(project, timeline, settings);
    return;
  }

  throw new Error(`Timeline action "${action}" is not implemented.`);
}

module.exports = {
  runTimelineTargetModule,
};