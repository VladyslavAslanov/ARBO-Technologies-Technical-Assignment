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

import { useStores } from "../../core/rootStore";
import { recordsScreenStyles } from "./RecordsScreenStyles";

export const RecordsScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const { sessionStore, recordsStore } = useStores();
  const router = useRouter();

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
      <View className={recordsScreenStyles.loading.center}>
        <ActivityIndicator />
        <Text className={recordsScreenStyles.loading.text}>
          {t("common:loading")}
        </Text>
      </View>
    );
  }

  if (sessionStore.error) {
    return (
      <View className={recordsScreenStyles.error.container}>
        <Text className={recordsScreenStyles.error.text}>
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
    <View className={recordsScreenStyles.screen}>
      <View className={recordsScreenStyles.header.container}>
        <Text className={recordsScreenStyles.header.title}>
          {t("screens:records.title")}
        </Text>

        <View className={recordsScreenStyles.header.actionsRow}>
          <Pressable
            onPress={() => router.push("/filters")}
            className={recordsScreenStyles.header.iconButton}
            hitSlop={10}
          >
            <Text className={recordsScreenStyles.header.iconText}>⚙︎</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/create")}
            className={recordsScreenStyles.header.iconButton}
            hitSlop={10}
          >
            <Text className={recordsScreenStyles.header.iconText}>+</Text>
          </Pressable>
        </View>
      </View>

      {!!recordsStore.error ? (
        <View className={recordsScreenStyles.error.container}>
          <Text className={recordsScreenStyles.error.text}>
            {t("common:error")}: {recordsStore.error}
          </Text>
        </View>
      ) : null}

      {isEmpty ? (
        <View className={recordsScreenStyles.empty.container}>
          <Text className={recordsScreenStyles.empty.text}>
            {t("screens:records.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recordsStore.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={recordsScreenStyles.list.contentContainerStyle}
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
              <View className={recordsScreenStyles.list.footerLoadingWrapper}>
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
                className={recordsScreenStyles.card.pressable}
              >
                <View className={recordsScreenStyles.card.container}>
                  <View className={recordsScreenStyles.card.row}>
                    {coverUri ? (
                      <Image
                        source={{ uri: coverUri }}
                        className={recordsScreenStyles.card.thumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className={recordsScreenStyles.card.thumb} />
                    )}

                    <View className="flex-1">
                      <Text className={recordsScreenStyles.card.title}>
                        {t(`defects:${item.defectType}.label`, {
                          defaultValue: item.defectType,
                        })}{" "}
                        • {item.severity}/5
                      </Text>

                      <Text className={recordsScreenStyles.card.meta}>
                        {new Date(item.createdAt).toLocaleString("cs-CZ")}
                      </Text>

                      <Text className={recordsScreenStyles.card.meta}>
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
