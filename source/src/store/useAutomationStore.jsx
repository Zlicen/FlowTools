import { useSyncExternalStore } from "react";
import { automationStore } from "./automationStore";

export function useAutomationStore() {
  return useSyncExternalStore(
    automationStore.subscribe,
    automationStore.getSnapshot,
    automationStore.getSnapshot
  );
}
