import React from "react";
import { Pressable, Text, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStores } from "../../core/rootStore";
import { languageToggleStyles } from "./LanguageToggleStyles";

type Lang = "cs" | "en";

const LanguageTogglePill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const pillClassName = [
    languageToggleStyles.pill.base,
    active ? languageToggleStyles.pill.active : languageToggleStyles.pill.inactive,
  ].join(" ");

  const textClassName = [
    languageToggleStyles.text.base,
    active ? languageToggleStyles.text.active : languageToggleStyles.text.inactive,
  ].join(" ");

  return (
    <Pressable onPress={onPress} className={pillClassName} hitSlop={6}>
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
};

const LanguageToggle = observer(({ className }: { className?: string }) => {
  const { languageStore } = useStores();
  const current = (languageStore.language ?? "cs") as Lang;

  const setLanguage = (next: Lang) => {
    if (next === current) return;
    languageStore.setLanguage(next);
  };

  return (
    <View className={[languageToggleStyles.wrap, className].filter(Boolean).join(" ")}>
      <LanguageTogglePill
        label="CZ"
        active={current === "cs"}
        onPress={() => setLanguage("cs")}
      />
      <LanguageTogglePill
        label="EN"
        active={current === "en"}
        onPress={() => setLanguage("en")}
      />
    </View>
  );
});

export default LanguageToggle;