function normalizeTrackType(value) {
  if (value === "audio") return "audio";
  if (value === "subtitle") return "subtitle";
  return "video";
}

async function setTrack(timeline, object) {
  const settings = object.settings || {};

  if (!timeline) {
    throw new Error("Set Track needs an active timeline.");
  }

  const trackType = normalizeTrackType(settings.trackType);
  const name = String(settings.name || "").trim();

  if (typeof timeline.AddTrack !== "function") {
    throw new Error("Resolve API does not support AddTrack.");
  }

  const ok = await timeline.AddTrack(trackType);

  if (!ok) {
    throw new Error(`Failed to create ${trackType} track.`);
  }

  // Track naming/color can be added later if Resolve API supports it reliably.
  if (name) {
    console.log(`Track name requested but not implemented yet: ${name}`);
  }
}

async function setMarker(timeline, object) {
  const settings = object.settings || {};

  if (!timeline) {
    throw new Error("Set Marker needs an active timeline.");
  }

  if (typeof timeline.AddMarker !== "function") {
    throw new Error("Resolve API does not support AddMarker.");
  }

  const frame = 0;
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
    throw new Error("Failed to set marker.");
  }
}

async function setRender(project) {
  if (!project || typeof project.AddRenderJob !== "function") {
    throw new Error("Resolve API does not support AddRenderJob.");
  }

  const jobId = await project.AddRenderJob();

  if (!jobId) {
    throw new Error("Failed to set render job.");
  }
}

async function runSetActionModule({
  project,
  timeline,
  runtime,
}) {
  const objects = runtime.objects || [];

  if (objects.length === 0) {
    throw new Error("Set action needs an object.");
  }

  for (const object of objects) {
    if (object.kind === "track") {
      await setTrack(timeline, object);
      continue;
    }

    if (object.kind === "marker") {
      await setMarker(timeline, object);
      continue;
    }

    if (object.kind === "render") {
      await setRender(project);
      continue;
    }

    throw new Error(
      `Set action does not support object "${object.kind}" yet.`
    );
  }
}

module.exports = {
  runSetActionModule,
};