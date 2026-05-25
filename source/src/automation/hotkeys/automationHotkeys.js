export function formatHotkey(hotkey) {
  if (!hotkey?.keys?.length) return "No keybind";
  return hotkey.keys.join(" + ");
}

export function normalizeKeyboardEvent(event) {
  const keys = [];

  if (event.ctrlKey) keys.push("Ctrl");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  if (event.metaKey) keys.push("Meta");

  const key = event.key;

  if (
    key &&
    !["Control", "Alt", "Shift", "Meta"].includes(key)
  ) {
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  }

  return keys;
}

export function hotkeysMatch(a, b) {
  if (!a?.length || !b?.length) return false;
  if (a.length !== b.length) return false;

  return a.every((key, index) => key === b[index]);
}