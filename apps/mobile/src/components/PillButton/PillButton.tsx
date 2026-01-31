import React from "react";
import { Pressable, Text } from "react-native";
import { pillButtonStyles } from "./PillButtonStyles";

interface PillButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const PillButton = ({ label, active, onPress }: PillButtonProps) => {
  const pressableClassName = [
    pillButtonStyles.pressable.base,
    active
      ? pillButtonStyles.pressable.active
      : pillButtonStyles.pressable.inactive,
  ].join(" ");

  const textClassName = [
    pillButtonStyles.text.base,
    active ? pillButtonStyles.text.active : pillButtonStyles.text.inactive,
  ].join(" ");

  return (
    <Pressable onPress={onPress} className={pressableClassName}>
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
};

export default PillButton;
