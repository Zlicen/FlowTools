async function movePlayhead(timeline, settings) {
  if (!timeline) {
    throw new Error("Playhead Move needs an active timeline.");
  }

  const moveMode = settings.moveMode || "timecode";

  if (moveMode === "timecode") {
    if (typeof timeline.SetCurrentTimecode !== "function") {
      throw new Error("Resolve API does not support SetCurrentTimecode.");
    }

    const timecode = String(settings.timecode || "").trim();

    if (!timecode) {
      throw new Error("Playhead Move needs a timecode.");
    }

    const ok = await timeline.SetCurrentTimecode(timecode);

    if (!ok) {
      throw new Error("Failed to move playhead.");
    }

    return;
  }

  throw new Error("Playhead Move by frame is not implemented yet.");
}

async function runPlayheadTargetModule({
  timeline,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "move";

  if (action === "move") {
    await movePlayhead(timeline, settings);
    return;
  }

  throw new Error(`Playhead action "${action}" is not implemented.`);
}

module.exports = {
  runPlayheadTargetModule,
};