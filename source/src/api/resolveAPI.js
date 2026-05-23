import { invoke } from "./ipcClient";

export async function debugMediaPool() {
  return await invoke("resolve-debug-media-pool");
}

export async function debugVideoClipUnderPlayhead(trackIndex = 1) {
  return await invoke("resolve-debug-video-clip-under-playhead", {
    trackIndex,
  });
}

export async function getProjectMediaBins() {
  return await invoke("project-media-get-bins");
}