import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export default function DefectTypeDropdown({
  label,
  items,
  selected,
  onToggle,
  onClear,
  onClose,
  visible,
  onOpen,
  renderLabel,
  tSelected,
  tAll,
  tClose,
  tClear,
}: {
  label: string;
  items: Array<{ key: string; category: string }>;
  selected: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  renderLabel: (key: string) => string;
  tSelected: string;
  tAll: string;
  tClose: string;
  tClear: string;
}) {
  const selectedCount = selected.length;

  return (
    <>
      <Pressable
        onPress={onOpen}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#ddd",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "600" }}>{label}</Text>
        <Text style={{ opacity: 0.7 }}>
          {selectedCount === 0 ? tAll : `${tSelected}: ${selectedCount}`}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, paddingTop: 60 }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{label}</Text>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={onClear} style={{ padding: 10 }}>
                <Text style={{ fontWeight: "600" }}>{tClear}</Text>
              </Pressable>
              <Pressable onPress={onClose} style={{ padding: 10 }}>
                <Text style={{ fontWeight: "600" }}>{tClose}</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {items.map((it) => {
              const active = selected.includes(it.key);
              return (
                <Pressable
                  key={it.key}
                  onPress={() => onToggle(it.key)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: active ? "#111" : "#ddd",
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    {renderLabel(it.key)}
                  </Text>
                  <Text>{active ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
