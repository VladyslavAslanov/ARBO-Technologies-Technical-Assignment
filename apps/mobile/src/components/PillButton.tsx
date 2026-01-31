import { Text } from "react-native";

interface PillButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function PillButton({
  label,
  active,
  onPress,
}: PillButtonProps) {
  return (
    <Text
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "#111" : "#ddd",
        backgroundColor: active ? "#111" : "transparent",
        color: active ? "#fff" : "#111",
        overflow: "hidden",
        marginRight: 8,
      }}
    >
      {label}
    </Text>
  );
}
