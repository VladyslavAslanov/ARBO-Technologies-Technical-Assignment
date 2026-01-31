import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { useStores } from "../core/rootStore";
import PillButton from "../components/PillButton";
import DefectTypeDropdown from "../components/DefectTypeDropdown";
import SingleSelectDropdown from "../components/SingleSelectDropdown";

const screenClassName = "flex-1 pt-16 bg-white dark:bg-zinc-950";

const headerClassName = "px-4 mb-3 flex-row items-center justify-between";

const titleClassName =
  "text-2xl font-semibold text-zinc-900 dark:text-zinc-100";

const addButtonClassName =
  "rounded-xl border border-zinc-900 dark:border-zinc-100 px-3 py-2";
const addButtonTextClassName = "font-semibold text-zinc-900 dark:text-zinc-100";

const sectionClassName = "px-4 mb-2.5";
const sectionLabelClassName = "mb-1.5 text-zinc-500 dark:text-zinc-400";

const rowClassName = "flex-row";

const severityRowClassName = "flex-row gap-2.5";

const hintClassName = "px-4 mb-2 text-zinc-500 dark:text-zinc-400";

const errorBoxClassName = "px-4 mb-2";
const errorTextClassName = "text-zinc-900 dark:text-zinc-100";

const emptyClassName = "flex-1 items-center justify-center";
const emptyTextClassName = "text-zinc-500 dark:text-zinc-400";

const listContentStyle = { paddingHorizontal: 16, paddingBottom: 24 };

const cardPressableClassName = "mb-2.5";
const cardClassName =
  "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3";

const cardRowClassName = "flex-row gap-3";
const thumbClassName =
  "w-[72px] h-[72px] rounded-xl bg-zinc-200 dark:bg-zinc-800";

const cardTitleClassName = "font-semibold text-zinc-900 dark:text-zinc-100";
const cardMetaClassName = "mt-1 text-zinc-500 dark:text-zinc-400";

const loadingCenterClassName = "flex-1 items-center justify-center";
const loadingTextClassName = "mt-2 text-zinc-500 dark:text-zinc-400";

export const RecordsScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const { sessionStore, recordsStore, defectTypesStore } = useStores();
  const router = useRouter();

  const [defectsOpen, setDefectsOpen] = useState(false);
  const [minOpen, setMinOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);

  const defectTypesKey = useMemo(
    () => recordsStore.selectedDefectTypes.slice().sort().join("|"),
    [recordsStore.selectedDefectTypes]
  );

  const severityKey = useMemo(
    () =>
      `${recordsStore.minSeverity ?? "n"}-${recordsStore.maxSeverity ?? "n"}`,
    [recordsStore.minSeverity, recordsStore.maxSeverity]
  );

  useEffect(() => {
    if (!sessionStore.isReady) return;
    if (!sessionStore.deviceId) return;
    recordsStore.loadFirstPage(sessionStore.deviceId);
  }, [
    sessionStore.isReady,
    sessionStore.deviceId,
    recordsStore.days,
    recordsStore.sortBy,
    recordsStore.order,
    defectTypesKey,
    severityKey,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      if (!sessionStore.isReady) return;
      if (!sessionStore.deviceId) return;
      recordsStore.loadFirstPage(sessionStore.deviceId);
    }, [sessionStore.isReady, sessionStore.deviceId])
  );

  if (!sessionStore.isReady) {
    return (
      <View className={loadingCenterClassName}>
        <ActivityIndicator />
        <Text className={loadingTextClassName}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (sessionStore.error) {
    return (
      <View className="flex-1 justify-center px-4 bg-white dark:bg-zinc-950">
        <Text className={errorTextClassName}>
          {t("common:error")}: {sessionStore.error}
        </Text>
      </View>
    );
  }

  const deviceId = sessionStore.deviceId!;
  const isInitialLoading = recordsStore.loading && recordsStore.offset === 0;
  const isEmpty =
    !isInitialLoading && !recordsStore.error && recordsStore.items.length === 0;

  return (
    <View className={screenClassName}>
      <View className={headerClassName}>
        <Text className={titleClassName}>{t("screens:records.title")}</Text>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push("/filters")}
            className="h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60"
            hitSlop={10}
          >
            <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              ⚙︎
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/create")}
            className="h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60"
            hitSlop={10}
          >
            <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              +
            </Text>
          </Pressable>
        </View>
      </View>

      {!!recordsStore.error ? (
        <View className={errorBoxClassName}>
          <Text className={errorTextClassName}>
            {t("common:error")}: {recordsStore.error}
          </Text>
        </View>
      ) : null}

      {isEmpty ? (
        <View className={emptyClassName}>
          <Text className={emptyTextClassName}>
            {t("screens:records.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recordsStore.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContentStyle}
          refreshControl={
            <RefreshControl
              refreshing={recordsStore.loading && recordsStore.offset === 0}
              onRefresh={() => recordsStore.loadFirstPage(deviceId)}
            />
          }
          onEndReachedThreshold={0.6}
          onEndReached={() => recordsStore.loadNextPage(deviceId)}
          ListFooterComponent={
            recordsStore.loading && recordsStore.offset > 0 ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const coverUri = item.coverPhotoPath
              ? `${process.env.EXPO_PUBLIC_API_URL}${item.coverPhotoPath}`
              : null;

            return (
              <Pressable
                onPress={() => router.push(`/records/${item.id}`)}
                className={cardPressableClassName}
              >
                <View className={cardClassName}>
                  <View className={cardRowClassName}>
                    {coverUri ? (
                      <Image
                        source={{ uri: coverUri }}
                        className={thumbClassName}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className={thumbClassName} />
                    )}

                    <View className="flex-1">
                      <Text className={cardTitleClassName}>
                        {t(`defects:${item.defectType}.label`, {
                          defaultValue: item.defectType,
                        })}{" "}
                        • {item.severity}/5
                      </Text>

                      <Text className={cardMetaClassName}>
                        {new Date(item.createdAt).toLocaleString("cs-CZ")}
                      </Text>

                      <Text className={cardMetaClassName}>
                        photos: {item.photosCount}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
});
