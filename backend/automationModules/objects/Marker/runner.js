const { getPlayheadFrame } = require("../../../automationCore/playhead");

function getMarkerName(marker) {
  return String(marker?.name || marker?.Name || "").trim();
}

function getMarkerColor(marker) {
  return marker?.color || marker?.Color || "Blue";
}

function getMarkerNote(marker) {
  return marker?.note || marker?.Note || "";
}

function getMarkerDuration(marker) {
  return marker?.duration || marker?.Duration || 1;
}

function getMarkerCustomData(marker) {
  return marker?.customData || marker?.CustomData || "";
}

async function getMarkers(timeline) {
  if (!timeline || typeof timeline.GetMarkers !== "function") {
    throw new Error("Resolve API does not support GetMarkers.");
  }

  const markers = await timeline.GetMarkers();

  return markers || {};
}

async function findMarkerByName(timeline, markerName) {
  const wantedName = String(markerName || "").trim();

  if (!wantedName) {
    throw new Error("Marker name is required.");
  }

  const markers = await getMarkers(timeline);

  for (const [frameKey, marker] of Object.entries(markers)) {
    const name = getMarkerName(marker);

    if (name === wantedName) {
      const frameNumber = Number(frameKey);

      if (!Number.isFinite(frameNumber)) {
        throw new Error(`Invalid marker frame: ${frameKey}`);
      }

      return {
        frame: frameNumber,
        marker,
      };
    }
  }

  throw new Error(`Marker "${wantedName}" was not found.`);
}

async function getTargetFrame(project, timeline, settings) {
  const position = settings.position || "currentPlayhead";

  if (position === "currentPlayhead") {
    return await getPlayheadFrame(project, timeline);
  }

  if (position === "frame") {
    return Math.max(0, Number(settings.frame || 0));
  }

  if (position === "timecode") {
    const timecode = String(settings.timecode || "").trim();

    if (!timecode) {
      throw new Error("Marker action needs a timecode.");
    }

    if (typeof timeline.SetCurrentTimecode !== "function") {
      throw new Error("Resolve API does not support SetCurrentTimecode.");
    }

    const ok = await timeline.SetCurrentTimecode(timecode);

    if (!ok) {
      throw new Error(`Failed to move playhead to timecode ${timecode}.`);
    }

    return await getPlayheadFrame(project, timeline);
  }

  return await getPlayheadFrame(project, timeline);
}

async function addMarkerAtFrame(timeline, frame, markerData) {
  if (!timeline || typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const frameNumber = Number(frame);

  if (!Number.isFinite(frameNumber)) {
    throw new Error(`Invalid marker frame: ${frame}`);
  }

  const color = markerData.color || "Blue";
  const name = markerData.name || "";
  const note = markerData.note || "";
  const duration = Number(markerData.duration || 1);
  const customData = markerData.customData || "";

  const ok = await timeline.AddMarker(
    frameNumber,
    color,
    name,
    note,
    duration,
    customData
  );

  if (!ok) {
    throw new Error(`Failed to add marker at frame ${frameNumber}.`);
  }
}

async function deleteMarkerAtFrame(project, timeline, frame) {
  if (!timeline || typeof timeline.DeleteMarkerAtFrame !== "function") {
    throw new Error("Resolve API does not support DeleteMarkerAtFrame.");
  }

  const frameNumber = Number(frame);

  if (!Number.isFinite(frameNumber)) {
    throw new Error(`Invalid marker frame: ${frame}`);
  }

  // Move playhead to marker frame first
  if (typeof timeline.SetCurrentTimecode === "function") {
    const { frameToTimecode } = require("../../../automationCore/timecode");
    const timecode = await frameToTimecode(project, timeline, frameNumber);
    await timeline.SetCurrentTimecode(timecode);
  }

  // Read playhead frame after moving there
  const currentFrame = await getPlayheadFrame(project, timeline);

  const ok = await timeline.DeleteMarkerAtFrame(currentFrame);

  if (!ok) {
    throw new Error(
      `Failed to delete marker. Marker frame: ${frameNumber}, playhead frame: ${currentFrame}`
    );
  }
}

function copyMarkerData(marker, overrides = {}) {
  return {
    color: overrides.color ?? getMarkerColor(marker),
    name: overrides.name ?? getMarkerName(marker),
    note: overrides.note ?? getMarkerNote(marker),
    duration: overrides.duration ?? getMarkerDuration(marker),
    customData: overrides.customData ?? getMarkerCustomData(marker),
  };
}

async function addMarker(project, timeline, settings) {
  const frame = await getTargetFrame(project, timeline, settings);

  await addMarkerAtFrame(timeline, frame, {
    color: settings.color || "Blue",
    name: settings.name || "",
    note: settings.note || "",
    duration: 1,
    customData: "",
  });
}

async function moveMarker(project, timeline, settings) {
  const found = await findMarkerByName(timeline, settings.markerName);
  const targetFrame = await getTargetFrame(project, timeline, settings);

  await deleteMarkerAtFrame(project, timeline, found.frame);
  await addMarkerAtFrame(timeline, targetFrame, copyMarkerData(found.marker));
}

async function duplicateMarker(project, timeline, settings) {
  const found = await findMarkerByName(timeline, settings.markerName);
  const targetFrame = await getTargetFrame(project, timeline, settings);

  await addMarkerAtFrame(timeline, targetFrame, copyMarkerData(found.marker));
}

async function renameMarker(project, timeline, settings) {
  const newName = String(settings.newName || "").trim();

  if (!newName) {
    throw new Error("Marker Rename needs a new name.");
  }

  const found = await findMarkerByName(timeline, settings.markerName);

  await deleteMarkerAtFrame(project, timeline, found.frame);
  await addMarkerAtFrame(
    timeline,
    found.frame,
    copyMarkerData(found.marker, {
      name: newName,
    })
  );
}

async function deleteMarker(project, timeline, settings) {
  const found = await findMarkerByName(timeline, settings.markerName);
  await deleteMarkerAtFrame(project, timeline, found.frame);
}

async function colorMarker(project, timeline, settings) {
  const found = await findMarkerByName(timeline, settings.markerName);

  await deleteMarkerAtFrame(project, timeline, found.frame);
  await addMarkerAtFrame(
    timeline,
    found.frame,
    copyMarkerData(found.marker, {
      color: settings.newColor || "Blue",
    })
  );
}

async function noteMarker(project, timeline, settings) {
  const found = await findMarkerByName(timeline, settings.markerName);

  await deleteMarkerAtFrame(project, timeline, found.frame);
  await addMarkerAtFrame(
    timeline,
    found.frame,
    copyMarkerData(found.marker, {
      note: settings.newNote || "",
    })
  );
}

async function runMarkerTargetModule({ project, timeline, module }) {
  if (!timeline) {
    throw new Error("Marker action needs an active timeline.");
  }

  const settings = module.settings || {};
  const action = settings.action || "add";

  if (action === "add") {
    await addMarker(project, timeline, settings);
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

  if (action === "rename") {
    await renameMarker(project, timeline, settings);
    return;
  }

  if (action === "delete") {
    await deleteMarker(project, timeline, settings);
    return;
  }

  if (action === "color") {
    await colorMarker(project, timeline, settings);
    return;
  }

  if (action === "note") {
    await noteMarker(project, timeline, settings);
    return;
  }

  throw new Error(`Marker action "${action}" is not implemented.`);
}

module.exports = {
  runMarkerTargetModule,
};