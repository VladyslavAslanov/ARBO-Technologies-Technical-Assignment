import "../i18n";

import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StoresContext, rootStore } from "../core/rootStore";

export default function RootLayout() {
  useEffect(() => {
    rootStore.sessionStore.init();
    const run = async () => {
      await rootStore.sessionStore.init();
      if (rootStore.sessionStore.deviceId) {
        await rootStore.defectTypesStore.load(rootStore.sessionStore.deviceId);
      }
    };
    run();
  }, []);

  return (
    <StoresContext.Provider value={rootStore}>
      <Stack screenOptions={{ headerShown: false }} />
    </StoresContext.Provider>
  );
}
