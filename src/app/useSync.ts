import { startSyncScheduler, stopSyncScheduler } from "@/entities/note/sync/lib/syncScheduler";
import { useEffect } from "react";

export const useSync = () => {
  useEffect(() => {
    startSyncScheduler(5000);

    return () => {
      stopSyncScheduler();
    };
  }, []);
}