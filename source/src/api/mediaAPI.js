import { invoke } from "./ipcClient";

export async function syncMediaLibrary() {
  return await invoke("media-library-sync");
}

export async function createTopBin(payload) {
  return await invoke("media-library-create-top-bin", payload);
}

export async function createChildFolder(payload) {
  return await invoke("media-library-create-child-folder", payload);
}

export async function updateTopBin(payload) {
  return await invoke("media-library-update-top-bin", payload);
}

export async function renameFolder(payload) {
  return await invoke("media-library-rename-folder", payload);
}

export async function deleteFolder(payload) {
  return await invoke("media-library-delete-folder", payload);
}

export async function importMedia(payload) {
  return await invoke("media-library-import-media", payload);
}

export async function deleteMedia(payload) {
  return await invoke("media-library-delete-media", payload);
}

export async function reorderFolders(payload) {
  return await invoke("media-library-reorder-folders", payload);
}

export async function reorderMedia(payload) {
  return await invoke("media-library-reorder-media", payload);
}
