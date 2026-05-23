import VideoClipObjectUI from "./VideoClipObjectUI";

export default {
  id: "object-video-clip",
  name: "Video Clip",
  description:
    "Position, zoom, rotation, crop, opacity, duplicate, delete or color video clips.",
  categoryId: "objects",
  categoryName: "Objects",

  createDefaultSettings() {
    return {
      action: "position",

      trackIndex: 1,

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
    };
  },

  SettingsComponent: VideoClipObjectUI,
};