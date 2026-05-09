"use client";

import { useCallback } from "react";
import { useApiKey } from "@/lib/api-key";

export function useAuthedFetch() {
  const { provider, apiKey, configured } = useApiKey();

  return useCallback(
    (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      if (configured && provider && apiKey) {
        headers.set("x-ai-provider", provider);
        headers.set("x-ai-key", apiKey);
      }
      return fetch(url, { ...options, headers });
    },
    [provider, apiKey, configured]
  );
}
