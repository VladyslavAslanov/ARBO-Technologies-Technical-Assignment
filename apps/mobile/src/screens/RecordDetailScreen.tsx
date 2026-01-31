import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
        if (!resp.ok) throw new Error(text || `Request failed: ${resp.status}`);

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
              if (!resp.ok)
                throw new Error(text || `Delete failed: ${resp.status}`);

              // Refresh list store (best-effort) and go back
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "600" }}>
            {t("screens:recordDetail.title")}
          </Text>
          <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
            <Text style={{ fontWeight: "600" }}>{t("common:close")}</Text>
          </Pressable>
        </View>

        <Text style={{ marginTop: 16 }}>
          {t("common:error")}: {error ?? "Not found"}
        </Text>
      </View>
    );
  }
  console.log(record);

  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "600" }}>
          {t("screens:recordDetail.title")}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={confirmDelete} style={{ padding: 10 }}>
            <Text style={{ fontWeight: "600" }}>{t("common:delete")}</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
            <Text style={{ fontWeight: "600" }}>{t("common:close")}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <Text style={{ fontWeight: "600" }}>
          {t(`defects:${record.defectType}.label`, {
            defaultValue: record.defectType,
          })}{" "}
          • {record.severity}/5
        </Text>

        <Text style={{ marginTop: 6, opacity: 0.7 }}>
          {new Date(record.createdAt).toLocaleString("cs-CZ")}
        </Text>

        {record.note ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ opacity: 0.7 }}>
              {t("screens:recordDetail.note")}
            </Text>
            <Text style={{ marginTop: 4 }}>{record.note}</Text>
          </View>
        ) : null}

        {record.lat != null && record.lng != null ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ opacity: 0.7 }}>
              {t("screens:recordDetail.location")}
            </Text>
            <Text style={{ marginTop: 4 }}>
              {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
              {record.locationAccuracy != null
                ? ` (±${Math.round(record.locationAccuracy)} m)`
                : ""}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 12 }}>
          <Text style={{ opacity: 0.7 }}>
            {t("screens:recordDetail.photos")}
          </Text>

          {record.photos.map((p) => (
            <View
              key={p.id}
              style={{
                marginTop: 10,
                padding: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "600" }}>Photo</Text>
              <Text style={{ opacity: 0.7 }} numberOfLines={1}>
                {resolvePhotoUrl(baseUrl, p.path)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

export default RecordDetailScreen;
