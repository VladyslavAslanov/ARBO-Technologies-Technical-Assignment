import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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

const triggerClassName =
  "flex-1 flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900";

const triggerLabelClassName = "font-semibold text-zinc-900 dark:text-zinc-100";
const triggerValueClassName = "text-zinc-500 dark:text-zinc-400";

const modalContainerClassName = "flex-1 bg-white pt-16 dark:bg-zinc-950";

const modalHeaderClassName =
  "flex-row items-center justify-between border-b border-zinc-200 px-4 pb-3 dark:border-zinc-800";

const modalTitleClassName =
  "text-lg font-semibold text-zinc-900 dark:text-zinc-100";

const closePressableClassName = "px-3 py-2";
const closeTextClassName = "font-semibold text-zinc-900 dark:text-zinc-100";

const listContentClassName = "p-4";

const optionPressableClassName =
  "mb-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900";

const optionTextClassName = "font-semibold text-zinc-900 dark:text-zinc-100";

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
      <Pressable onPress={onOpen} className={triggerClassName}>
        <Text className={triggerLabelClassName}>{label}</Text>
        <Text className={triggerValueClassName}>{valueLabel}</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className={modalContainerClassName}>
          <View className={modalHeaderClassName}>
            <Text className={modalTitleClassName}>{label}</Text>

            <Pressable onPress={onClose} className={closePressableClassName}>
              <Text className={closeTextClassName}>OK</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName={listContentClassName}>
            {options.map((opt) => (
              <Pressable
                key={String(opt.value)}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={optionPressableClassName}
              >
                <Text className={optionTextClassName}>{opt.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default SingleSelectDropdown;
