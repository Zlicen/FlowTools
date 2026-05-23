const objectActionRules = {
  "object-track": [
    "add",
    "rename",
    "delete",
    "duplicate",
  ],

  "object-marker": [
    "add",
    "duplicate",
  ],

  "object-timeline": [
    "duplicate",
    "rename",
    "delete",
  ],

  "object-playhead": [
    "move",
  ],

  "object-video-clip": [
    "position",
    "zoom",
    "rotation",
    "crop",
    "opacity",
    "duplicate",
    "delete",
    "color",
  ],

  "object-audio-clip": [
    "volume",
    "pitch",
    "duplicate",
    "delete",
    "color",
  ],
};

function getAllModuleCapabilities() {
  return {
    objectActionRules,
  };
}

module.exports = {
  getAllModuleCapabilities,
  objectActionRules,
};