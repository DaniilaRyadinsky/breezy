import { startSyncScheduler, stopSyncScheduler } from "./syncScheduler";
import { useEffect } from "react";

export const useSync = () => {
  useEffect(() => {
    startSyncScheduler(5000);

    return () => {
      stopSyncScheduler();
    };
  }, []);
}