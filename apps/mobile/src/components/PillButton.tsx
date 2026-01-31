import React from "react";
import { Pressable, Text } from "react-native";

interface PillButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const basePressableClass = "mr-2 rounded-full border px-3 py-1.5";

const activePressableClass =
  "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800";

const inactivePressableClass =
  "border-zinc-200 bg-transparent dark:border-zinc-800 dark:bg-transparent";

const baseTextClass = "font-semibold";
const activeTextClass = "text-zinc-900 dark:text-zinc-100";
const inactiveTextClass = "text-zinc-700 dark:text-zinc-300";

const PillButton = ({ label, active, onPress }: PillButtonProps) => {
  const pressableClassName = [
    basePressableClass,
    active ? activePressableClass : inactivePressableClass,
  ].join(" ");

  const textClassName = [
    baseTextClass,
    active ? activeTextClass : inactiveTextClass,
  ].join(" ");

  return (
    <Pressable onPress={onPress} className={pressableClassName}>
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
};

export default PillButton;
