function getFunctionNames(object) {
  if (!object) return [];

  const names = new Set();
  let current = object;

  while (current) {
    for (const name of Object.getOwnPropertyNames(current)) {
      try {
        if (typeof object[name] === "function") {
          names.add(name);
        }
      } catch {}
    }

    current = Object.getPrototypeOf(current);
  }

  return [...names].sort();
}

async function safeCall(label, fn) {
  try {
    const result = await fn();

    return {
      label,
      success: true,
      type: typeof result,
      isArray: Array.isArray(result),
      keys: result && typeof result === "object" ? Object.keys(result) : [],
      functions:
        result && typeof result === "object" ? getFunctionNames(result) : [],
      value:
        result === null || typeof result !== "object"
          ? result
          : "[object returned]",
    };
  } catch (error) {
    return {
      label,
      success: false,
      error: String(error),
    };
  }
}

async function safeValue(label, object, methodName) {
  if (!object || typeof object[methodName] !== "function") {
    return {
      label,
      methodName,
      available: false,
      value: null,
    };
  }

  try {
    const value = await object[methodName]();

    return {
      label,
      methodName,
      available: true,
      value,
      type: typeof value,
    };
  } catch (error) {
    return {
      label,
      methodName,
      available: true,
      error: String(error),
    };
  }
}

function timecodeToFrames(timecode) {
  const parts = String(timecode || "")
    .replace(";", ":")
    .split(":")
    .map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [hours, minutes, seconds, frames] = parts;

  return {
    hours,
    minutes,
    seconds,
    frames,
  };
}

async function getPlayheadFrame(project, timeline) {
  const currentTimecode =
    typeof timeline.GetCurrentTimecode === "function"
      ? await timeline.GetCurrentTimecode()
      : null;

  const frameRate =
    typeof timeline.GetSetting === "function"
      ? Number(await timeline.GetSetting("timelineFrameRate"))
      : 24;

  const parsed = timecodeToFrames(currentTimecode);

  if (!parsed || !Number.isFinite(frameRate)) {
    return null;
  }

  return Math.round(
    (parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds) * frameRate +
      parsed.frames
  );
}

async function debugVideoClipUnderPlayhead(getResolve, args = {}) {
  const resolve = getResolve();

  if (!resolve) {
    throw new Error("Resolve is not connected.");
  }

  const trackIndex = Math.max(1, Number(args.trackIndex || 1));

  const projectManager = await resolve.GetProjectManager();
  const project = await projectManager.GetCurrentProject();

  if (!project) {
    throw new Error("No Resolve project is open.");
  }

  const timeline = await project.GetCurrentTimeline();

  if (!timeline) {
    throw new Error("No current timeline found.");
  }

  const playheadFrame = await getPlayheadFrame(project, timeline);
  const clips = (await timeline.GetItemListInTrack("video", trackIndex)) || [];

  const clipSummaries = [];

  let targetClip = null;

  for (const clip of clips) {
    const start = Number(await clip.GetStart());
    const end = Number(await clip.GetEnd());

    clipSummaries.push({
      start,
      end,
      durationByStartEnd: end - start,
      containsPlayhead:
        Number.isFinite(playheadFrame) &&
        playheadFrame >= start &&
        playheadFrame < end,
    });

    if (
      !targetClip &&
      Number.isFinite(playheadFrame) &&
      playheadFrame >= start &&
      playheadFrame < end
    ) {
      targetClip = clip;
    }
  }

  if (!targetClip) {
    return {
      success: false,
      message: `No video clip found under playhead on video track ${trackIndex}.`,
      trackIndex,
      playheadFrame,
      clipsOnTrack: clipSummaries,
    };
  }

  const mediaPoolItem =
    typeof targetClip.GetMediaPoolItem === "function"
      ? await targetClip.GetMediaPoolItem()
      : null;

  const values = [
    await safeValue("Timeline Start", targetClip, "GetStart"),
    await safeValue("Timeline End", targetClip, "GetEnd"),
    await safeValue("Timeline Duration", targetClip, "GetDuration"),
    await safeValue("Source Start Frame", targetClip, "GetSourceStartFrame"),
    await safeValue("Source End Frame", targetClip, "GetSourceEndFrame"),
    await safeValue("Source Start", targetClip, "GetSourceStart"),
    await safeValue("Source End", targetClip, "GetSourceEnd"),
    await safeValue("Left Offset", targetClip, "GetLeftOffset"),
    await safeValue("Right Offset", targetClip, "GetRightOffset"),
    await safeValue("Clip Property", targetClip, "GetClipProperty"),
  ];

  const mediaPoolValues = mediaPoolItem
    ? [
        await safeValue("MediaPool Name", mediaPoolItem, "GetName"),
        await safeValue("MediaPool Clip Property", mediaPoolItem, "GetClipProperty"),
      ]
    : [];

  return {
    success: true,
    trackIndex,
    playheadFrame,
    clipsOnTrack: clipSummaries,
    targetClip: {
      functions: getFunctionNames(targetClip),
      values,
      mediaPoolItem: mediaPoolItem
        ? {
            functions: getFunctionNames(mediaPoolItem),
            values: mediaPoolValues,
          }
        : null,
    },
  };
}

function registerResolveDebugIpc(ipcMain, getResolve) {
  ipcMain.handle("resolve-debug-media-pool", async () => {
    const resolve = getResolve();

    if (!resolve) {
      throw new Error("Resolve is not connected.");
    }

    const projectManager = await resolve.GetProjectManager();
    const project = await projectManager.GetCurrentProject();
    const mediaPool = await project.GetMediaPool();

    const checks = [];

    checks.push({
      label: "resolve",
      functions: getFunctionNames(resolve),
    });

    checks.push({
      label: "project",
      functions: getFunctionNames(project),
    });

    checks.push({
      label: "mediaPool",
      functions: getFunctionNames(mediaPool),
    });

    checks.push(await safeCall("mediaPool.GetRootFolder()", () => mediaPool.GetRootFolder()));
    checks.push(await safeCall("mediaPool.GetCurrentFolder()", () => mediaPool.GetCurrentFolder()));
    checks.push(await safeCall("mediaPool.GetPowerBinFolder()", () => mediaPool.GetPowerBinFolder()));
    checks.push(await safeCall("mediaPool.GetPowerBinList()", () => mediaPool.GetPowerBinList()));
    checks.push(await safeCall("mediaPool.GetSmartBinList()", () => mediaPool.GetSmartBinList()));

    return {
      success: true,
      checks,
    };
  });

  ipcMain.handle("resolve-debug-video-clip-under-playhead", async (event, args) => {
    return await debugVideoClipUnderPlayhead(getResolve, args);
  });
}

module.exports = {
  registerResolveDebugIpc,
};