import { useCallback, useEffect, useState } from "react";
import { fetchAppData, getMockAppData } from "../api/appData";
import type { AppData } from "../api/mockData";
import type { Language } from "../types/pet";

export function useAppData(language: Language) {
  const [data, setData] = useState<AppData>(() => getMockAppData(language));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      setData(await fetchAppData(language));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load app data.",
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    setData(getMockAppData(language));
    void reload();
  }, [language, reload]);

  return {
    data,
    errorMessage,
    isLoading,
    reload,
  };
}
