async function setRenderJob(project) {
  if (!project || typeof project.AddRenderJob !== "function") {
    throw new Error("Resolve API does not support AddRenderJob.");
  }

  const jobId = await project.AddRenderJob();

  if (!jobId) {
    throw new Error("Failed to create render job.");
  }
}

async function deleteRenderJob() {
  throw new Error("Render Delete is not implemented yet.");
}

async function startRender(project) {
  if (!project || typeof project.StartRendering !== "function") {
    throw new Error("Resolve API does not support StartRendering.");
  }

  const ok = await project.StartRendering();

  if (!ok) {
    throw new Error("Failed to start rendering.");
  }
}

async function runRenderTargetModule({
  project,
  module,
}) {
  const settings = module.settings || {};
  const action = settings.action || "set";

  if (action === "set") {
    await setRenderJob(project, settings);
    return;
  }

  if (action === "delete") {
    await deleteRenderJob(project, settings);
    return;
  }

  if (action === "render") {
    await startRender(project, settings);
    return;
  }

  throw new Error(`Render action "${action}" is not implemented.`);
}

module.exports = {
  runRenderTargetModule,
};