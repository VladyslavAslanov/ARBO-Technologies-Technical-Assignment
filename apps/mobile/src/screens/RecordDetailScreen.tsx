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

import { useStores } from "../core/rootStore";

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

function resolvePhotoUrl(baseUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path}`;
}

function parseApiErrorMessage(raw: string): string {
  if (!raw) return "Request failed";

  try {
    const data = JSON.parse(raw);
    const msg = (data?.message ?? data?.error ?? data) as unknown;

    if (Array.isArray(msg)) return msg.join("\n");
    if (typeof msg === "string") return msg;

    return raw;
  } catch {
    return raw;
  }
}

const loadingCenterClassName = "flex-1 items-center justify-center";
const loadingTextClassName = "mt-2 text-zinc-500 dark:text-zinc-400";

const screenClassName = "flex-1 pt-16 bg-white dark:bg-zinc-950";

const headerClassName = "px-4 mb-3 flex-row items-center justify-between";
const titleClassName =
  "text-2xl font-semibold text-zinc-900 dark:text-zinc-100";

const headerActionsClassName = "flex-row gap-2";
const headerActionPressableClassName = "px-3 py-2";
const headerActionTextClassName =
  "font-semibold text-zinc-900 dark:text-zinc-100";

const errorContainerClassName = "flex-1 pt-16 px-4 bg-white dark:bg-zinc-950";
const errorTextClassName = "mt-4 text-zinc-900 dark:text-zinc-100";

const bodyContentClassName = "px-4 pb-6";

const primaryTextClassName = "font-semibold text-zinc-900 dark:text-zinc-100";
const metaTextClassName = "mt-1.5 text-zinc-500 dark:text-zinc-400";

const sectionClassName = "mt-4";
const sectionLabelClassName = "text-zinc-500 dark:text-zinc-400";

const emptyPhotosClassName =
  "mt-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3";
const emptyPhotosTextClassName = "text-zinc-500 dark:text-zinc-400";

const photoCardClassName =
  "mt-2.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900";

const photoImageClassName = "w-full h-[220px] bg-zinc-200 dark:bg-zinc-800";
const photoFooterClassName = "px-3 py-2";
const photoPathClassName = "text-xs text-zinc-500 dark:text-zinc-400";

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

  if (!deviceId) {
    return (
      <View className={loadingCenterClassName}>
        <ActivityIndicator />
        <Text className={loadingTextClassName}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className={loadingCenterClassName}>
        <ActivityIndicator />
        <Text className={loadingTextClassName}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View className={errorContainerClassName}>
        <View className={headerClassName}>
          <Text className={titleClassName}>
            {t("screens:recordDetail.title")}
          </Text>

          <Pressable
            onPress={() => router.back()}
            className={headerActionPressableClassName}
          >
            <Text className={headerActionTextClassName}>
              {t("common:close")}
            </Text>
          </Pressable>
        </View>

        <Text className={errorTextClassName}>
          {t("common:error")}: {error ?? "Not found"}
        </Text>
      </View>
    );
  }

  return (
    <View className={screenClassName}>
      <View className={headerClassName}>
        <Text className={titleClassName}>
          {t("screens:recordDetail.title")}
        </Text>

        <View className={headerActionsClassName}>
          <Pressable
            onPress={confirmDelete}
            className={headerActionPressableClassName}
          >
            <Text className={headerActionTextClassName}>
              {t("common:delete")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className={headerActionPressableClassName}
          >
            <Text className={headerActionTextClassName}>
              {t("common:close")}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerClassName={bodyContentClassName}>
        <Text className={primaryTextClassName}>
          {t(`defects:${record.defectType}.label`, {
            defaultValue: record.defectType,
          })}{" "}
          • {record.severity}/5
        </Text>

        <Text className={metaTextClassName}>
          {new Date(record.createdAt).toLocaleString("cs-CZ")}
        </Text>

        {record.note ? (
          <View className={sectionClassName}>
            <Text className={sectionLabelClassName}>
              {t("screens:recordDetail.note")}
            </Text>
            <Text className={[primaryTextClassName, "mt-1"].join(" ")}>
              {record.note}
            </Text>
          </View>
        ) : null}

        {record.lat != null && record.lng != null ? (
          <View className={sectionClassName}>
            <Text className={sectionLabelClassName}>
              {t("screens:recordDetail.location")}
            </Text>
            <Text className={[primaryTextClassName, "mt-1"].join(" ")}>
              {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
              {record.locationAccuracy != null
                ? ` (±${Math.round(record.locationAccuracy)} m)`
                : ""}
            </Text>
          </View>
        ) : null}

        <View className={sectionClassName}>
          <Text className={sectionLabelClassName}>
            {t("screens:recordDetail.photos")}
          </Text>

          {record.photos.length === 0 ? (
            <View className={emptyPhotosClassName}>
              <Text className={emptyPhotosTextClassName}>
                {t("screens:recordDetail.photosEmpty", {
                  defaultValue: "Žádné fotografie.",
                })}
              </Text>
            </View>
          ) : (
            record.photos.map((p) => (
              <View key={p.id} className={photoCardClassName}>
                <Image
                  source={{ uri: resolvePhotoUrl(baseUrl, p.path) }}
                  className={photoImageClassName}
                  resizeMode="cover"
                />
                <View className={photoFooterClassName}>
                  <Text className={photoPathClassName} numberOfLines={1}>
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
