import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { useStores } from "../core/rootStore";
import { getCurrentLocation } from "../services/locationService";

type PickedPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
};

const MAX_PHOTOS = 10;
const MAX_BYTES = 5 * 1024 * 1024;

async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

async function ensureMediaPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

async function normalizeToJpeg(
  assetUri: string
): Promise<{ uri: string; mimeType: string }> {
  // Convert to JPEG and reduce size if needed. Start with good quality and scale down progressively.
  let currentUri = assetUri;

  for (const step of [
    { compress: 0.9, resize: undefined as number | undefined },
    { compress: 0.8, resize: 1920 },
    { compress: 0.7, resize: 1600 },
    { compress: 0.6, resize: 1280 },
  ]) {
    const actions: ImageManipulator.Action[] = [];
    if (step.resize) actions.push({ resize: { width: step.resize } });

    const result = await ImageManipulator.manipulateAsync(currentUri, actions, {
      compress: step.compress,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Note: file size check will be done by fetching blob size before upload.
    currentUri = result.uri;
  }

  return { uri: currentUri, mimeType: "image/jpeg" };
}

async function getFileSizeBytes(uri: string): Promise<number> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob.size;
}

export const CreateRecordScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const router = useRouter();
  const { sessionStore, defectTypesStore } = useStores();

  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [defectType, setDefectType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number | null;
  } | null>(null);

  const deviceId = sessionStore.deviceId;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const res = await getCurrentLocation();
      if (cancelled) return;
      if (res.ok) {
        setLocation({ lat: res.lat, lng: res.lng, accuracy: res.accuracy });
      } else {
        setLocation(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      !!deviceId &&
      !!defectType &&
      photos.length >= 1 &&
      photos.length <= MAX_PHOTOS &&
      !submitting
    );
  }, [deviceId, defectType, photos.length, submitting]);

  const addAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    setPhotos((prev) => {
      const next = prev.slice();
      for (const a of assets) {
        if (next.length >= MAX_PHOTOS) break;
        next.push({
          uri: a.uri,
          width: a.width,
          height: a.height,
          fileSize: (a as any).fileSize,
          mimeType: a.mimeType,
        });
      }
      return next;
    });
  };

  const pickFromLibrary = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) {
      Alert.alert("Permission", "Media library permission is required");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (res.canceled) return;
    addAssets(res.assets);
  };

  const takePhoto = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) {
      Alert.alert("Permission", "Camera permission is required");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (res.canceled) return;
    addAssets(res.assets);
  };

  const removePhotoAt = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!deviceId) return;
    if (!defectType) return;

    if (photos.length < 1) {
      Alert.alert("Validation", "At least 1 photo is required");
      return;
    }

    setSubmitting(true);

    try {
      // Normalize and validate size
      const normalized: Array<{ uri: string; mimeType: string; size: number }> =
        [];
      for (const p of photos) {
        const { uri, mimeType } = await normalizeToJpeg(p.uri);
        const size = await getFileSizeBytes(uri);

        if (size > MAX_BYTES) {
          throw new Error(
            "One of the photos is larger than 5 MB after normalization"
          );
        }

        normalized.push({ uri, mimeType, size });
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL!;
      const form = new FormData();

      form.append("defectType", defectType);
      form.append("severity", String(severity));
      if (note.trim().length) form.append("note", note.trim());

      // Server expects "photos" field
      normalized.forEach((p, idx) => {
        form.append("photos", {
          uri: p.uri,
          name: `photo_${idx + 1}.jpg`,
          type: p.mimeType,
        } as any);
      });

      const resp = await fetch(`${baseUrl}/api/records`, {
        method: "POST",
        headers: {
          "x-device-id": deviceId,
        },
        body: form,
      });

      const text = await resp.text();
      if (!resp.ok) {
        throw new Error(text || `Upload failed with ${resp.status}`);
      }
      if (location) {
        form.append("lat", String(location.lat));
        form.append("lng", String(location.lng));
        if (location.accuracy != null)
          form.append("locationAccuracy", String(location.accuracy));
      }
      // Back to list and refresh
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to create record");
    } finally {
      setSubmitting(false);
    }
  };

  if (!deviceId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t("common:loading")}</Text>
      </View>
    );
  }

  const defectOptions = defectTypesStore.items;

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
        <Text style={{ fontSize: 22, fontWeight: "600" }}>Nový záznam</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Text style={{ fontWeight: "600" }}>Zavřít</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={{ marginBottom: 6, opacity: 0.7 }}>Defekt</Text>

        <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10 }}>
          {defectOptions.map((it) => {
            const active = defectType === it.key;
            return (
              <Pressable
                key={it.key}
                onPress={() => setDefectType(it.key)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderTopWidth: it.key === defectOptions[0]?.key ? 0 : 1,
                  borderTopColor: "#eee",
                  backgroundColor: active ? "#111" : "transparent",
                }}
              >
                <Text
                  style={{ color: active ? "#fff" : "#111", fontWeight: "600" }}
                >
                  {t(`defects:${it.key}.label`, { defaultValue: it.key })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ marginTop: 16, marginBottom: 6, opacity: 0.7 }}>
          Závažnost (1–5)
        </Text>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setSeverity(n)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: severity === n ? "#111" : "#ddd",
                backgroundColor: severity === n ? "#111" : "transparent",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: severity === n ? "#fff" : "#111",
                  fontWeight: "600",
                }}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ marginTop: 16, marginBottom: 6, opacity: 0.7 }}>
          Poznámka
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Volitelné…"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />

        <Text style={{ marginTop: 16, marginBottom: 6, opacity: 0.7 }}>
          Fotky ({photos.length}/{MAX_PHOTOS})
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={takePhoto}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#111",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Sfotografovat</Text>
          </Pressable>

          <Pressable
            onPress={pickFromLibrary}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#111",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Vybrat z galerie</Text>
          </Pressable>
        </View>

        {photos.length > 0 ? (
          <View style={{ marginTop: 12 }}>
            {photos.map((p, idx) => (
              <Pressable
                key={`${p.uri}-${idx}`}
                onPress={() => removePhotoAt(idx)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontWeight: "600" }}>Photo {idx + 1}</Text>
                <Text style={{ opacity: 0.7 }} numberOfLines={1}>
                  {p.uri}
                </Text>
                <Text style={{ opacity: 0.7 }}>Tap to remove</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>
          {location
            ? `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (±${location.accuracy ?? "—"} m)`
            : "GPS: —"}
        </Text>

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={{
            marginTop: 16,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: canSubmit ? "#111" : "#ddd",
            alignItems: "center",
          }}
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{ color: canSubmit ? "#fff" : "#666", fontWeight: "600" }}
            >
              Odeslat
            </Text>
          )}
        </Pressable>

        <Text style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>
          Limit: max 10 fotek, každá do 5 MB (po převodu do JPEG).
        </Text>
      </ScrollView>
    </View>
  );
});
