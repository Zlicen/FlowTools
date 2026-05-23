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
  "transform",
  "crop",
  "speed",
  "opacity",
  "duplicate",
  "delete",
  "move",
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