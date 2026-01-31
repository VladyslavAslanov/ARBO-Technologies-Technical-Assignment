import "../i18n";

import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StoresContext, rootStore } from "../core/rootStore";

export default function RootLayout() {
  useEffect(() => {
    // Initialize session once on app start
    rootStore.sessionStore.init();
  }, []);

  return (
    <StoresContext.Provider value={rootStore}>
      <Stack screenOptions={{ headerShown: false }} />
    </StoresContext.Provider>
  );
}
