import VideoClipObjectUI from "./VideoClipObjectUI";

export default {
  id: "object-video-clip",
  name: "Video Clip",
  description: "Transform, crop, speed, opacity, duplicate, delete, move or color video clips.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "transform",

      findBy: "underPlayhead",
      trackIndex: 1,

      positionX: 0,
      positionY: 0,
      zoomX: 1,
      zoomY: 1,
      rotationAngle: 0,

      cropLeft: 0,
      cropRight: 0,
      cropTop: 0,
      cropBottom: 0,
      cropSoftness: 0,

      speed: 100,
      opacity: 100,

      targetTrackIndex: 1,
      offsetFrames: 0,

      color: "Blue",
    };
  },

  SettingsComponent: VideoClipObjectUI,
};