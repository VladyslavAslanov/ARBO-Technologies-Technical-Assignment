import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useStores } from "../core/rootStore";
import PillButton from "../components/PillButton";
import DefectTypeDropdown from "../components/DefectTypeDropdown";
import SingleSelectDropdown from "../components/SingleSelectDropdown";

const screenClassName = "flex-1 pt-16 bg-white dark:bg-zinc-950";
const headerClassName = "px-4 mb-3 flex-row items-center justify-between";
const titleClassName =
  "text-2xl font-semibold text-zinc-900 dark:text-zinc-100";

const headerActionPressableClassName = "px-3 py-2";
const headerActionTextClassName =
  "font-semibold text-zinc-900 dark:text-zinc-100";

const contentClassName = "px-4 pb-6";
const labelClassName = "mb-1.5 text-zinc-500 dark:text-zinc-400";

export const FilterScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const router = useRouter();
  const { recordsStore, defectTypesStore } = useStores();

  const [defectsOpen, setDefectsOpen] = useState(false);
  const [minOpen, setMinOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);

  return (
    <View className={screenClassName}>
      <View className={headerClassName}>
        <Text className={titleClassName}>
          {t("screens:filters.title", { defaultValue: "Filtry" })}
        </Text>

        <Pressable
          onPress={() => router.back()}
          className={headerActionPressableClassName}
        >
          <Text className={headerActionTextClassName}>
            {t("common:close", { defaultValue: "Zavřít" })}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName={contentClassName}>
        <Text className={labelClassName}>
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

        <View className="mt-4">
          <Text className={labelClassName}>
            {t("screens:records.filters.days", { defaultValue: "Období" })}
          </Text>

          <View className="flex-row">
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

        <View className="mt-4">
          <Text className={labelClassName}>
            {t("screens:records.filters.sort", { defaultValue: "Řazení" })}
          </Text>

          <View className="flex-row">
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

        <View className="mt-4">
          <Text className={labelClassName}>
            {t("screens:records.filters.severity", {
              defaultValue: "Závažnost",
            })}
          </Text>

          <View className="flex-row gap-2.5">
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

        <View className="mt-6">
          <Pressable
            onPress={() => recordsStore.resetFilters()}
            className="mt-6 items-center rounded-xl border border-zinc-300 dark:border-zinc-700 py-3"
          >
            <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t("screens:filters.reset", { defaultValue: "Resetovat" })}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
});
