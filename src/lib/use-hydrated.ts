"use client";

import { useEffect, useState } from "react";
import { useSalesStore } from "@/store/use-sales-store";

/**
 * The store is created from the seed on the server and rehydrated from
 * localStorage on the client. Render the shell first, then the workspace, so
 * the static HTML and the first client render always match.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useSalesStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
