const { getPlayheadFrame } = require("../../../automationCore/playhead");

async function getMarkerFrame(project, timeline, settings) {
  if (settings.timeMode === "frame") {
    return Math.max(0, Number(settings.frame || 0));
  }

  return await getPlayheadFrame(project, timeline);
}

async function setMarker(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Marker Set needs an active timeline.");
  }

  if (typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const frame = await getMarkerFrame(project, timeline, settings);
  const color = settings.color || "Green";
  const name = settings.name || "Marker";

  const ok = await timeline.AddMarker(
    frame,
    color,
    name,
    "",
    1
  );

  if (!ok) {
    throw new Error(`Failed to set marker at frame ${frame}.`);
  }
}

async function deleteMarker(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Marker Delete needs an active timeline.");
  }

  if (typeof timeline.DeleteMarkerAtFrame !== "function") {
    throw new Error("Resolve API does not support DeleteMarkerAtFrame.");
  }

  const frame = await getMarkerFrame(project, timeline, settings);

  const ok = await timeline.DeleteMarkerAtFrame(frame);

  if (!ok) {
    throw new Error(`Failed to delete marker at frame ${frame}.`);
  }
}

async function renameMarker(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Marker Rename needs an active timeline.");
  }

  if (typeof timeline.DeleteMarkerAtFrame !== "function") {
    throw new Error("Resolve API does not support DeleteMarkerAtFrame.");
  }

  if (typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const frame = await getMarkerFrame(project, timeline, settings);
  const markers =
    typeof timeline.GetMarkers === "function"
      ? await timeline.GetMarkers()
      : {};

  const existingMarker = markers?.[frame];

  if (!existingMarker) {
    throw new Error(`No marker found at frame ${frame}.`);
  }

  const newName = String(settings.newName || "").trim();

  if (!newName) {
    throw new Error("Marker Rename needs a new name.");
  }

  await timeline.DeleteMarkerAtFrame(frame);

  const ok = await timeline.AddMarker(
    frame,
    existingMarker.color || existingMarker.Color || settings.color || "Green",
    newName,
    existingMarker.note || existingMarker.Note || "",
    existingMarker.duration || existingMarker.Duration || 1
  );

  if (!ok) {
    throw new Error("Failed to rename marker.");
  }
}

async function moveMarker(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Marker Move needs an active timeline.");
  }

  if (typeof timeline.DeleteMarkerAtFrame !== "function") {
    throw new Error("Resolve API does not support DeleteMarkerAtFrame.");
  }

  if (typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const fromFrame = await getMarkerFrame(project, timeline, settings);
  const toFrame = Math.max(0, Number(settings.moveToFrame || 0));

  const markers =
    typeof timeline.GetMarkers === "function"
      ? await timeline.GetMarkers()
      : {};

  const existingMarker = markers?.[fromFrame];

  if (!existingMarker) {
    throw new Error(`No marker found at frame ${fromFrame}.`);
  }

  await timeline.DeleteMarkerAtFrame(fromFrame);

  const ok = await timeline.AddMarker(
    toFrame,
    existingMarker.color || existingMarker.Color || settings.color || "Green",
    existingMarker.name || existingMarker.Name || settings.name || "Marker",
    existingMarker.note || existingMarker.Note || "",
    existingMarker.duration || existingMarker.Duration || 1
  );

  if (!ok) {
    throw new Error("Failed to move marker.");
  }
}

async function duplicateMarker(project, timeline, settings) {
  if (!timeline) {
    throw new Error("Marker Duplicate needs an active timeline.");
  }

  if (typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const frame = await getMarkerFrame(project, timeline, settings);
  const count = Math.max(1, Number(settings.duplicateCount || 1));

  const markers =
    typeof timeline.GetMarkers === "function"
      ? await timeline.GetMarkers()
      : {};

  const existingMarker = markers?.[frame];

  if (!existingMarker) {
    throw new Error(`No marker found at frame ${frame}.`);
  }

  for (let index = 1; index <= count; index += 1) {
    const ok = await timeline.AddMarker(
      frame + index,
      existingMarker.color || existingMarker.Color || settings.color || "Green",
      existingMarker.name || existingMarker.Name || settings.name || "Marker",
      existingMarker.note || existingMarker.Note || "",
      existingMarker.duration || existingMarker.Duration || 1
    );

    if (!ok) {
      throw new Error("Failed to duplicate marker.");
    }
  }
}

async function runMarkerTargetModule({
  project,
  timeline,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setMarker(project, timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteMarker(project, timeline, settings);
    return;
  }

  if (action === "rename") {
    await renameMarker(project, timeline, settings);
    return;
  }

  if (action === "move") {
    await moveMarker(project, timeline, settings);
    return;
  }

  if (action === "duplicate") {
    await duplicateMarker(project, timeline, settings);
    return;
  }

  throw new Error(`Marker action "${action}" is not implemented.`);
}

module.exports = {
  runMarkerTargetModule,
};