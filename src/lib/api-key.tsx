"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ApiKeyContextValue {
  provider: string;
  apiKey: string;
  configured: boolean;
  setConfig: (provider: string, apiKey: string) => void;
  clearConfig: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  provider: "",
  apiKey: "",
  configured: false,
  setConfig: () => {},
  clearConfig: () => {},
});

const STORAGE_KEY = "rtm-api-config";

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProvider(parsed.provider ?? "");
        setApiKey(parsed.apiKey ?? "");
      }
    } catch {}
  }, []);

  const setConfig = useCallback((p: string, k: string) => {
    setProvider(p);
    setApiKey(k);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider: p, apiKey: k }));
  }, []);

  const clearConfig = useCallback(() => {
    setProvider("");
    setApiKey("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ApiKeyContext.Provider
      value={{
        provider,
        apiKey,
        configured: !!(provider && apiKey),
        setConfig,
        clearConfig,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
