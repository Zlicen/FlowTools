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
    "duplicate",
    "delete",
    "color",
  ],

  "object-compound-clip": [
    "create",
    "rename",
    "delete",
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