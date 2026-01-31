import { Pressable, Modal, ScrollView, Text, View } from "react-native";

const SingleSelectDropdown = ({
  label,
  valueLabel,
  options,
  visible,
  onOpen,
  onClose,
  onSelect,
}: {
  label: string;
  valueLabel: string;
  options: Array<{ label: string; value: number | null }>;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (value: number | null) => void;
}) => {
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
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "600" }}>{label}</Text>
        <Text style={{ opacity: 0.7 }}>{valueLabel}</Text>
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
            <Pressable onPress={onClose} style={{ padding: 10 }}>
              <Text style={{ fontWeight: "600" }}>OK</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {options.map((opt) => (
              <Pressable
                key={String(opt.value)}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{opt.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default SingleSelectDropdown;
