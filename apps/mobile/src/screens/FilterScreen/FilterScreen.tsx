import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useStores } from "../../core/rootStore";
import PillButton from "../../components/PillButton/PillButton";
import DefectTypeDropdown from "../../components/DefectTypeDropdown/DefectTypeDropdown";
import SingleSelectDropdown from "../../components/SingleSelectDropdown/SingleSelectDropdown";
import { filterScreenStyles } from "./FilterScreenStyles";

export const FilterScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const router = useRouter();
  const { recordsStore, defectTypesStore } = useStores();

  const [defectsOpen, setDefectsOpen] = useState(false);
  const [minOpen, setMinOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);

  return (
    <View className={filterScreenStyles.screen}>
      <View className={filterScreenStyles.header}>
        <Text className={filterScreenStyles.title}>
          {t("screens:filters.title", { defaultValue: "Filtry" })}
        </Text>

        <Pressable
          onPress={() => router.back()}
          className={filterScreenStyles.headerAction.pressable}
        >
          <Text className={filterScreenStyles.headerAction.text}>
            {t("common:close", { defaultValue: "Zavřít" })}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName={filterScreenStyles.content}>
        <Text className={filterScreenStyles.label}>
          {t("screens:records.filters.defectType", { defaultValue: "Defekt" })}
        </Text>

        <DefectTypeDropdown
          label={t("screens:records.filters.defectType")}
          items={defectTypesStore.items}
          selected={recordsStore.selectedDefectTypes}
          onToggle={(k) => recordsStore.toggleDefectType(k)}
          onClear={() => recordsStore.clearDefectTypes()}
          visible={defectsOpen}
          onOpen={() => setDefectsOpen(true)}
          onClose={() => setDefectsOpen(false)}
          renderLabel={(key) =>
            t(`defects:${key}.label`, { defaultValue: key })
          }
          tSelected={t("screens:records.filters.selected")}
          tAll={t("screens:records.filters.allDefects")}
          tClose={t("screens:records.filters.close")}
          tClear={t("screens:records.filters.clear")}
        />

        <View className={filterScreenStyles.section.spacer}>
          <Text className={filterScreenStyles.label}>
            {t("screens:records.filters.days", { defaultValue: "Období" })}
          </Text>

          <View className={filterScreenStyles.row.base}>
            <PillButton
              label="7"
              active={recordsStore.days === 7}
              onPress={() => recordsStore.setDays(7)}
            />
            <PillButton
              label="14"
              active={recordsStore.days === 14}
              onPress={() => recordsStore.setDays(14)}
            />
            <PillButton
              label="30"
              active={recordsStore.days === 30}
              onPress={() => recordsStore.setDays(30)}
            />
          </View>
        </View>

        <View className={filterScreenStyles.section.spacer}>
          <Text className={filterScreenStyles.label}>
            {t("screens:records.filters.sort", { defaultValue: "Řazení" })}
          </Text>

          <View className={filterScreenStyles.row.base}>
            <PillButton
              label={t("screens:records.filters.sortCreatedAt")}
              active={recordsStore.sortBy === "createdAt"}
              onPress={() => recordsStore.setSortBy("createdAt")}
            />
            <PillButton
              label={t("screens:records.filters.sortSeverity")}
              active={recordsStore.sortBy === "severity"}
              onPress={() => recordsStore.setSortBy("severity")}
            />
            <PillButton
              label={recordsStore.order.toUpperCase()}
              active
              onPress={() => recordsStore.toggleOrder()}
            />
          </View>
        </View>

        <View className={filterScreenStyles.section.spacer}>
          <Text className={filterScreenStyles.label}>
            {t("screens:records.filters.severity", {
              defaultValue: "Závažnost",
            })}
          </Text>

          <View className={filterScreenStyles.row.gap}>
            <SingleSelectDropdown
              label={t("screens:records.filters.min", { defaultValue: "Min" })}
              valueLabel={
                recordsStore.minSeverity == null
                  ? t("screens:records.filters.any", { defaultValue: "—" })
                  : String(recordsStore.minSeverity)
              }
              options={[
                {
                  label: t("screens:records.filters.any", {
                    defaultValue: "—",
                  }),
                  value: null,
                },
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
                { label: "5", value: 5 },
              ]}
              visible={minOpen}
              onOpen={() => setMinOpen(true)}
              onClose={() => setMinOpen(false)}
              onSelect={(v) => recordsStore.setMinSeverity(v)}
            />

            <SingleSelectDropdown
              label={t("screens:records.filters.max", { defaultValue: "Max" })}
              valueLabel={
                recordsStore.maxSeverity == null
                  ? t("screens:records.filters.any", { defaultValue: "—" })
                  : String(recordsStore.maxSeverity)
              }
              options={[
                {
                  label: t("screens:records.filters.any", {
                    defaultValue: "—",
                  }),
                  value: null,
                },
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
                { label: "5", value: 5 },
              ]}
              visible={maxOpen}
              onOpen={() => setMaxOpen(true)}
              onClose={() => setMaxOpen(false)}
              onSelect={(v) => recordsStore.setMaxSeverity(v)}
            />
          </View>
        </View>

        <View className={filterScreenStyles.resetButton.wrapper}>
          <Pressable
            onPress={() => recordsStore.resetFilters()}
            className={filterScreenStyles.resetButton.pressable}
          >
            <Text className={filterScreenStyles.resetButton.text}>
              {t("screens:records.filters.reset", { defaultValue: "Resetovat" })}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
});
