export function findNodeById(nodes, id) {
  if (!id) return null;

  for (const node of nodes || []) {
    if (node.id === id) return node;

    const found = findNodeById(node.folders || [], id);
    if (found) return found;
  }

  return null;
}

export function getFolderType(bins, folderId) {
  for (const bin of bins || []) {
    if (bin.id === folderId) return bin.type;

    const found = findNodeById(bin.folders || [], folderId);
    if (found) return bin.type;
  }

  return "normal";
}

export function getMediaIcon(name = "") {
  const ext = name.split(".").pop().toLowerCase();

  if (["mp4", "mov", "mkv", "avi", "wmv", "webm"].includes(ext)) return "🎞";
  if (["wav", "mp3", "aac", "flac", "m4a", "ogg"].includes(ext)) return "🎵";
  if (["png", "jpg", "jpeg", "exr", "bmp", "gif"].includes(ext)) return "🖼";
  if (["setting", "comp"].includes(ext)) return "✨";
  if (ext === "drfx") return "⚡";
  if (ext === "cube") return "🎨";

  return "📄";
}
