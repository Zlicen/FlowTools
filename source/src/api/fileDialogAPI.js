export async function chooseLutFile() {
  const electron = window.require("electron");
  const { ipcRenderer } = electron;

  return await ipcRenderer.invoke("dialog-choose-lut-file");
}