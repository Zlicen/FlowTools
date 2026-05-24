import PlayheadObjectUI from "./PlayheadObjectUI";

export default {
  id: "object-playhead",

  name: "Playhead",

  description:
    "Move the timeline playhead to clips, frames or timecodes",

  categoryId: "objects",
  categoryName: "Objects",

  direction: "forward",
  frames: 1,

  createDefaultSettings() {
    return {
      action: "move",

      moveTo: "timecode",

      timecode: "",
      frame: 0,

      direction: "forward",
      frames: 1,

      trackType: "any",
      trackIndex: 1,
    };
  },

  validateSettings(settings) {
    const warnings = [];

    if (
      settings.moveTo === "timecode" &&
      !String(settings.timecode || "").trim()
    ) {
      warnings.push("Missing target timecode");
    }

    if (
      settings.moveTo === "frame" &&
      (
        settings.frame === undefined ||
        settings.frame < 0
      )
    ) {
      warnings.push("Missing target frame");
    }

    if (
      settings.moveTo === "framesFromCurrent" &&
      (
        settings.frames === undefined ||
        settings.frames < 1
      )
    ) {
      warnings.push("Missing frame amount");
    }

    if (
      (
        settings.moveTo === "nextClip" ||
        settings.moveTo === "previousClip"
      ) &&
      settings.trackType !== "any" &&
      (
        settings.trackIndex === undefined ||
        settings.trackIndex < 1
      )
    ) {
      warnings.push("Missing target track");
    }

    return warnings;
  },

  SettingsComponent: PlayheadObjectUI,
};