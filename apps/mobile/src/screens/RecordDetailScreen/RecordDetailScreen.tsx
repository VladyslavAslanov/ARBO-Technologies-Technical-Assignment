import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

import { useStores } from "../../core/rootStore";
import { recordDetailScreenStyles } from "./RecordDetailScreenStyles";
import { parseApiErrorMessage, resolvePhotoUrl } from "../../helpers/helpers";

type RecordPhoto = {
  id: string;
  path: string;
  createdAt: string;
};

type RecordDetail = {
  id: string;
  defectType: string;
  severity: number;
  note: string | null;
  createdAt: string;
  recordedAt: string | null;
  lat: number | null;
  lng: number | null;
  locationAccuracy: number | null;
  photos: RecordPhoto[];
};

const RecordDetailScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionStore, recordsStore } = useStores();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<RecordDetail | null>(null);

  const deviceId = sessionStore.deviceId;
  const baseUrl = process.env.EXPO_PUBLIC_API_URL!;

  useEffect(() => {
    if (!deviceId) return;
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(`${baseUrl}/api/records/${id}`, {
          headers: { "x-device-id": deviceId },
        });

        const text = await resp.text();
        if (!resp.ok) throw new Error(parseApiErrorMessage(text));

        const json = JSON.parse(text) as RecordDetail;
        if (!cancelled) setRecord(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [deviceId, id, baseUrl]);

  const confirmDelete = () => {
    if (!deviceId || !id) return;

    Alert.alert(
      t("screens:recordDetail.deleteTitle"),
      t("screens:recordDetail.deleteConfirm"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("common:delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const resp = await fetch(`${baseUrl}/api/records/${id}`, {
                method: "DELETE",
                headers: { "x-device-id": deviceId },
              });

              const text = await resp.text();
              if (!resp.ok) throw new Error(parseApiErrorMessage(text));

              await recordsStore.loadFirstPage(deviceId);
              router.back();
            } catch (e: any) {
              Alert.alert(t("common:error"), e?.message ?? "Delete failed");
            }
          },
        },
      ]
    );
  };

  const LoadingView = () => (
    <View className={recordDetailScreenStyles.loading.center}>
      <ActivityIndicator />
      <Text className={recordDetailScreenStyles.loading.text}>
        {t("common:loading")}
      </Text>
    </View>
  );

  if (!deviceId) return <LoadingView />;
  if (loading) return <LoadingView />;

  if (error || !record) {
    return (
      <View className={recordDetailScreenStyles.error.container}>
        <View className={recordDetailScreenStyles.header.container}>
          <Text className={recordDetailScreenStyles.header.title}>
            {t("screens:recordDetail.title")}
          </Text>

          <Pressable
            onPress={() => router.back()}
            className={recordDetailScreenStyles.header.actionPressable}
          >
            <Text className={recordDetailScreenStyles.header.actionText}>
              {t("common:close")}
            </Text>
          </Pressable>
        </View>

        <Text className={recordDetailScreenStyles.error.text}>
          {t("common:error")}: {error ?? "Not found"}
        </Text>
      </View>
    );
  }

  return (
    <View className={recordDetailScreenStyles.screen}>
      <View className={recordDetailScreenStyles.header.container}>
        <Text className={recordDetailScreenStyles.header.title}>
          {t("screens:recordDetail.title")}
        </Text>

        <View className={recordDetailScreenStyles.header.actionsRow}>
          <Pressable
            onPress={confirmDelete}
            className={recordDetailScreenStyles.header.actionPressable}
          >
            <Text className={recordDetailScreenStyles.header.actionText}>
              {t("common:delete")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className={recordDetailScreenStyles.header.actionPressable}
          >
            <Text className={recordDetailScreenStyles.header.actionText}>
              {t("common:close")}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerClassName={recordDetailScreenStyles.body.content}
      >
        <Text className={recordDetailScreenStyles.text.primary}>
          {t(`defects:${record.defectType}.label`, {
            defaultValue: record.defectType,
          })}{" "}
          • {record.severity}/5
        </Text>

        <Text className={recordDetailScreenStyles.text.meta}>
          {new Date(record.createdAt).toLocaleString("cs-CZ")}
        </Text>

        {record.note ? (
          <View className={recordDetailScreenStyles.section.wrapper}>
            <Text className={recordDetailScreenStyles.text.sectionLabel}>
              {t("screens:recordDetail.note")}
            </Text>
            <Text
              className={[
                recordDetailScreenStyles.text.primary,
                recordDetailScreenStyles.section.noteTextSpacing,
              ].join(" ")}
            >
              {record.note}
            </Text>
          </View>
        ) : null}

        {record.lat != null && record.lng != null ? (
          <View className={recordDetailScreenStyles.section.wrapper}>
            <Text className={recordDetailScreenStyles.text.sectionLabel}>
              {t("screens:recordDetail.location")}
            </Text>
            <Text
              className={[
                recordDetailScreenStyles.text.primary,
                recordDetailScreenStyles.section.noteTextSpacing,
              ].join(" ")}
            >
              {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
              {record.locationAccuracy != null
                ? ` (±${Math.round(record.locationAccuracy)} m)`
                : ""}
            </Text>
          </View>
        ) : null}

        <View className={recordDetailScreenStyles.section.wrapper}>
          <Text className={recordDetailScreenStyles.text.sectionLabel}>
            {t("screens:recordDetail.photos")}
          </Text>

          {record.photos.length === 0 ? (
            <View className={recordDetailScreenStyles.photos.emptyContainer}>
              <Text className={recordDetailScreenStyles.text.emptyPhotos}>
                {t("screens:recordDetail.photosEmpty", {
                  defaultValue: "Žádné fotografie.",
                })}
              </Text>
            </View>
          ) : (
            record.photos.map((p) => (
              <View key={p.id} className={recordDetailScreenStyles.photos.card}>
                <Image
                  source={{ uri: resolvePhotoUrl(baseUrl, p.path) }}
                  className={recordDetailScreenStyles.photos.image}
                  resizeMode="cover"
                />
                <View className={recordDetailScreenStyles.photos.footer}>
                  <Text
                    className={recordDetailScreenStyles.photos.path}
                    numberOfLines={1}
                  >
                    {p.path}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
});

export default RecordDetailScreen;
