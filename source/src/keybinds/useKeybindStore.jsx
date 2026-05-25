import { useSyncExternalStore } from "react";
import { keybindStore } from "./keybindStore";

export function useKeybindStore() {
  return useSyncExternalStore(
    keybindStore.subscribe,
    keybindStore.getSnapshot,
    keybindStore.getSnapshot
  );
}