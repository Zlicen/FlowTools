const { runTimelineTargetModule } = require("./objects/Timeline/runner");
const { runTrackTargetModule } = require("./objects/Track/runner");
const {
  runTimelineMediaTargetModule,
} = require("./objects/TimelineMedia/runner");
const {
  runProjectMediaTargetModule,
} = require("./objects/ProjectMedia/runner");
const { runPlayheadTargetModule } = require("./objects/Playhead/runner");
const { runMarkerTargetModule } = require("./objects/Marker/runner");
const { runRenderTargetModule } = require("./objects/Render/runner");

const { runSetActionModule } = require("./actions/Set/runner");
const { runDeleteActionModule } = require("./actions/Delete/runner");
const { runMoveActionModule } = require("./actions/Move/runner");
const { runDuplicateActionModule } = require("./actions/Duplicate/runner");
const { runRenameActionModule } = require("./actions/Rename/runner");

const moduleRunners = {
  "object-timeline": runTimelineTargetModule,
  "object-track": runTrackTargetModule,
  "object-timeline-media": runTimelineMediaTargetModule,
  "object-project-media": runProjectMediaTargetModule,
  "object-playhead": runPlayheadTargetModule,
  "object-marker": runMarkerTargetModule,
  "object-render": runRenderTargetModule,

  "action-set": runSetActionModule,
  "action-delete": runDeleteActionModule,
  "action-move": runMoveActionModule,
  "action-duplicate": runDuplicateActionModule,
  "action-rename": runRenameActionModule,
};

function getModuleRunner(moduleType) {
  return moduleRunners[moduleType] || null;
}

module.exports = {
  moduleRunners,
  getModuleRunner,
};