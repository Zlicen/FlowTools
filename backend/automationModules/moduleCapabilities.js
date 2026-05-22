const objectActionRules = {
  "object-track": [
    "set",
    "delete",
    "rename",
    "move",
    "duplicate",
  ],

  "object-marker": [
    "set",
    "delete",
    "rename",
    "move",
    "duplicate",
  ],

  "object-timeline": [
    "set",
    "rename",
    "duplicate",
    "delete",
    "render",
  ],

  "object-timeline-media": [
    "set",
    "delete",
    "rename",
    "move",
    "duplicate",
  ],

  "object-project-media": [
    "set",
    "delete",
    "rename",
    "move",
    "duplicate",
  ],

  "object-playhead": [
    "move",
  ],

  "object-render": [
    "set",
    "delete",
    "render",
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