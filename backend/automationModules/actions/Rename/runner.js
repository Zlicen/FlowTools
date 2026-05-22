async function renameTimeline(object) {
  const settings = object.settings || {};
  const newName = String(settings.name || "").trim();

  if (!newName) {
    throw new Error("Rename Timeline needs a name in the Timeline object settings.");
  }

  if (!object.timeline || typeof object.timeline.SetName !== "function") {
    throw new Error("Timeline object does not support renaming.");
  }

  const ok = await object.timeline.SetName(newName);

  if (!ok) {
    throw new Error("Failed to rename timeline.");
  }
}

async function runRenameActionModule({ runtime }) {
  const objects = runtime.objects || [];

  if (objects.length === 0) {
    throw new Error("Rename action needs an object.");
  }

  for (const object of objects) {
    if (object.kind === "timeline") {
      await renameTimeline(object);
      continue;
    }

    throw new Error(`Rename action does not support object "${object.kind}" yet.`);
  }
}

module.exports = {
  runRenameActionModule,
};