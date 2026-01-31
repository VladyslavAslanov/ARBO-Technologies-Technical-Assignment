import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { defectTypeDropdownStyles } from "./DefectTypeDropdownStyles";

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
      <Pressable
        onPress={onOpen}
        className={defectTypeDropdownStyles.trigger.container}
      >
        <Text className={defectTypeDropdownStyles.trigger.label}>{label}</Text>
        <Text className={defectTypeDropdownStyles.trigger.value}>
          {triggerValue}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className={defectTypeDropdownStyles.modal.container}>
          <View className={defectTypeDropdownStyles.modal.header}>
            <Text className={defectTypeDropdownStyles.modal.title}>
              {label}
            </Text>

            <View className={defectTypeDropdownStyles.headerActions.row}>
              <Pressable
                onPress={onClear}
                className={defectTypeDropdownStyles.headerActions.pressable}
              >
                <Text className={defectTypeDropdownStyles.headerActions.text}>
                  {tClear}
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className={defectTypeDropdownStyles.headerActions.pressable}
              >
                <Text className={defectTypeDropdownStyles.headerActions.text}>
                  {tClose}
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            contentContainerClassName={defectTypeDropdownStyles.list.content}
          >
            {items.map((it) => {
              const active = selected.includes(it.key);

              const optionClassName = [
                defectTypeDropdownStyles.option.base,
                active
                  ? defectTypeDropdownStyles.option.active
                  : defectTypeDropdownStyles.option.inactive,
              ].join(" ");

              return (
                <Pressable
                  key={it.key}
                  onPress={() => onToggle(it.key)}
                  className={optionClassName}
                >
                  <Text className={defectTypeDropdownStyles.option.label}>
                    {renderLabel(it.key)}
                  </Text>
                  <Text className={defectTypeDropdownStyles.option.check}>
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
