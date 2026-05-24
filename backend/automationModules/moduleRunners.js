const { runTimelineTargetModule } = require("./objects/Timeline/runner");
const { runTrackTargetModule } = require("./objects/Track/runner");
const { runPlayheadTargetModule } = require("./objects/Playhead/runner");
const { runMarkerTargetModule } = require("./objects/Marker/runner");
const { runVideoClipTargetModule } = require("./objects/VideoClip/runner");
const { runAudioClipTargetModule } = require("./objects/AudioClip/runner");
const { runCompoundClipTargetModule } = require("./objects/CompoundClip/runner");

const moduleRunners = {
  "object-timeline": runTimelineTargetModule,
  "object-track": runTrackTargetModule,
  "object-playhead": runPlayheadTargetModule,
  "object-marker": runMarkerTargetModule,
  "object-video-clip": runVideoClipTargetModule,
  "object-audio-clip": runAudioClipTargetModule,
  "object-compound-clip": runCompoundClipTargetModule,
};

function getModuleRunner(moduleType) {
  return moduleRunners[moduleType] || null;
}

module.exports = {
  moduleRunners,
  getModuleRunner,
};