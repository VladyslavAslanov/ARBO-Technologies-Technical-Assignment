import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type DefectTypeItem = { key: string; category: string };

interface DefectTypeDropdownProps {
  label: string;
  items: DefectTypeItem[];
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
}

const triggerClassName =
  "flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900";

const triggerLabelClassName = "font-semibold text-zinc-900 dark:text-zinc-100";
const triggerValueClassName = "text-zinc-500 dark:text-zinc-400";

const modalContainerClassName = "flex-1 bg-white pt-16 dark:bg-zinc-950";

const modalHeaderClassName =
  "flex-row items-center justify-between border-b border-zinc-200 px-4 pb-3 dark:border-zinc-800";

const modalTitleClassName =
  "text-lg font-semibold text-zinc-900 dark:text-zinc-100";

const headerActionsRowClassName = "flex-row";

const headerActionPressableClassName = "px-3 py-2";
const headerActionTextClassName =
  "font-semibold text-zinc-900 dark:text-zinc-100";

const listContentClassName = "p-4";

const optionBaseClassName =
  "mb-2.5 flex-row items-center justify-between rounded-xl border px-3 py-3";

const optionActiveClassName =
  "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900";
const optionInactiveClassName =
  "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

const optionLabelClassName = "font-semibold text-zinc-900 dark:text-zinc-100";
const optionCheckClassName = "text-zinc-900 dark:text-zinc-100";

const DefectTypeDropdown = ({
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
}: DefectTypeDropdownProps) => {
  const selectedCount = selected.length;

  const triggerValue =
    selectedCount === 0 ? tAll : `${tSelected}: ${selectedCount}`;

  return (
    <>
      <Pressable onPress={onOpen} className={triggerClassName}>
        <Text className={triggerLabelClassName}>{label}</Text>
        <Text className={triggerValueClassName}>{triggerValue}</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className={modalContainerClassName}>
          <View className={modalHeaderClassName}>
            <Text className={modalTitleClassName}>{label}</Text>

            <View className={headerActionsRowClassName}>
              <Pressable
                onPress={onClear}
                className={headerActionPressableClassName}
              >
                <Text className={headerActionTextClassName}>{tClear}</Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className={headerActionPressableClassName}
              >
                <Text className={headerActionTextClassName}>{tClose}</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerClassName={listContentClassName}>
            {items.map((it) => {
              const active = selected.includes(it.key);
              const optionClassName = [
                optionBaseClassName,
                active ? optionActiveClassName : optionInactiveClassName,
              ].join(" ");

              return (
                <Pressable
                  key={it.key}
                  onPress={() => onToggle(it.key)}
                  className={optionClassName}
                >
                  <Text className={optionLabelClassName}>
                    {renderLabel(it.key)}
                  </Text>
                  <Text className={optionCheckClassName}>
                    {active ? "✓" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default DefectTypeDropdown;
