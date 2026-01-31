import "../../global.css";

import "../i18n";

import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { StoresContext, rootStore } from "../core/rootStore";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    const run = async () => {
      await rootStore.sessionStore.init();
      const deviceId = rootStore.sessionStore.deviceId;
      if (deviceId) {
        await rootStore.defectTypesStore.load(deviceId);
      }
    };
    run();
  }, []);

  return (
    <StoresContext.Provider value={rootStore}>
      <View className="flex-1 bg-white dark:bg-zinc-950">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </StoresContext.Provider>
  );
}
