async function deleteTrack(timeline, object) {
  const settings = object.settings || {};

  if (!timeline) {
    throw new Error("Delete Track needs an active timeline.");
  }

  if (typeof timeline.DeleteTrack !== "function") {
    throw new Error("Resolve API does not support DeleteTrack.");
  }

  const ok = await timeline.DeleteTrack(
    settings.trackType || object.trackType || "video",
    Math.max(1, Number(settings.trackIndex || object.trackIndex || 1))
  );

  if (!ok) {
    throw new Error("Failed to delete track.");
  }
}

async function deleteMarker(timeline, object) {
  const settings = object.settings || {};

  if (!timeline) {
    throw new Error("Delete Marker needs an active timeline.");
  }

  if (typeof timeline.DeleteMarkerAtFrame !== "function") {
    throw new Error("Resolve API does not support DeleteMarkerAtFrame.");
  }

  const frame = Math.max(0, Number(settings.frame || object.frame || 0));

  const ok = await timeline.DeleteMarkerAtFrame(frame);

  if (!ok) {
    throw new Error("Failed to delete marker.");
  }
}

async function runDeleteActionModule({ timeline, runtime }) {
  const objects = runtime.objects || [];

  if (objects.length === 0) {
    throw new Error("Delete action needs an object.");
  }

  for (const object of objects) {
    if (object.kind === "track") {
      await deleteTrack(timeline, object);
      continue;
    }

    if (object.kind === "marker") {
      await deleteMarker(timeline, object);
      continue;
    }

    throw new Error(`Delete action does not support object "${object.kind}" yet.`);
  }
}

module.exports = {
  runDeleteActionModule,
};