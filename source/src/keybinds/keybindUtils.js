export function createKeybindTargetId(type, id) {
  return `${type}:${id}`;
}

export function formatHotkey(binding) {
  if (!binding?.keys?.length) return "No keybind";
  return binding.keys.join(" + ");
}

export function normalizeKeyboardEvent(event) {
  const keys = [];

  if (event.ctrlKey) keys.push("Ctrl");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  if (event.metaKey) keys.push("Meta");

  const key = event.key;

  if (key && !["Control", "Alt", "Shift", "Meta"].includes(key)) {
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  }

  return keys;
}

export function hotkeysMatch(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length === 0 || b.length === 0) return false;
  if (a.length !== b.length) return false;

  return a.every((key, index) => key === b[index]);
}

export function findKeybindConflict(bindings, targetId, keys) {
  if (!Array.isArray(keys) || keys.length === 0) return null;

  for (const [bindingTargetId, binding] of Object.entries(bindings || {})) {
    if (bindingTargetId === targetId) continue;
    if (!binding?.enabled) continue;

    if (hotkeysMatch(binding.keys, keys)) {
      return {
        targetId: bindingTargetId,
        binding,
      };
    }
  }

  return null;
}