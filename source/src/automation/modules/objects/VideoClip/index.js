import VideoClipObjectUI from "./VideoClipObjectUI";

export default {
  id: "object-video-clip",

  name: "Video Clip",

  description:
    "Manage and automate video clips on the current timeline",

  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "duplicate",

      trackIndex: 1,

      name: "Video Clip",

      zoom: 1,

      positionX: 0,
      positionY: 0,

      rotationAngle: 0,

      duplicateToTrackIndex: 2,

      cropLeft: 0,
      cropRight: 0,
      cropTop: 0,
      cropBottom: 0,
      cropSoftness: 0,

      opacity: 100,

      color: "Blue",

      nodeIndex: 1,
      lutPath: "",
    };
  },

  validateSettings(settings) {
    const warnings = [];

    const action = settings.action;

    if (
      settings.trackIndex === undefined ||
      settings.trackIndex < 1
    ) {
      warnings.push("Missing source track");
    }

    if (
      action === "rename" &&
      !String(settings.name || "").trim()
    ) {
      warnings.push("Missing new clip name");
    }

    if (
      action === "duplicate" &&
      (
        settings.duplicateToTrackIndex === undefined ||
        settings.duplicateToTrackIndex < 1
      )
    ) {
      warnings.push("Missing destination track");
    }

    if (
      action === "lut" &&
      !String(settings.lutPath || "").trim()
    ) {
      warnings.push("Missing LUT file");
    }

    if (
      action === "lut" &&
      (
        settings.nodeIndex === undefined ||
        settings.nodeIndex < 1
      )
    ) {
      warnings.push("Missing color node");
    }

    if (
      action === "zoom" &&
      settings.zoom <= 0
    ) {
      warnings.push("Zoom must be above 0");
    }

    if (
      action === "opacity" &&
      (
        settings.opacity < 0 ||
        settings.opacity > 100
      )
    ) {
      warnings.push("Opacity must be 0–100");
    }

    return warnings;
  },

  SettingsComponent: VideoClipObjectUI,
};