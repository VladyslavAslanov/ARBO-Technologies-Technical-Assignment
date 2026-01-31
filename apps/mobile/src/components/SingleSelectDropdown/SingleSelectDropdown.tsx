import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { singleSelectDropdownStyles } from "./SingleSelectDropdownStyles";

type Option = { label: string; value: number | null };

interface SingleSelectDropdownProps {
  label: string;
  valueLabel: string;
  options: Option[];
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (value: number | null) => void;
}

const SingleSelectDropdown = ({
  label,
  valueLabel,
  options,
  visible,
  onOpen,
  onClose,
  onSelect,
}: SingleSelectDropdownProps) => {
  return (
    <>
      <Pressable
        onPress={onOpen}
        className={singleSelectDropdownStyles.trigger.container}
      >
        <Text className={singleSelectDropdownStyles.trigger.label}>
          {label}
        </Text>
        <Text className={singleSelectDropdownStyles.trigger.value}>
          {valueLabel}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className={singleSelectDropdownStyles.modal.container}>
          <View className={singleSelectDropdownStyles.modal.header}>
            <Text className={singleSelectDropdownStyles.modal.title}>
              {label}
            </Text>

            <Pressable
              onPress={onClose}
              className={singleSelectDropdownStyles.modal.closePressable}
            >
              <Text className={singleSelectDropdownStyles.modal.closeText}>
                OK
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName={singleSelectDropdownStyles.list.content}
          >
            {options.map((opt) => (
              <Pressable
                key={String(opt.value)}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={singleSelectDropdownStyles.option.pressable}
              >
                <Text className={singleSelectDropdownStyles.option.text}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default SingleSelectDropdown;
