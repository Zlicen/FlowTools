const electronRequire = typeof window !== "undefined" ? window.require : null;
const ipcRenderer = electronRequire ? electronRequire("electron").ipcRenderer : null;

export async function invoke(channel, payload) {
  if (!ipcRenderer) {
    throw new Error("Electron IPC is not available.");
  }

  return await ipcRenderer.invoke(channel, payload);
}
