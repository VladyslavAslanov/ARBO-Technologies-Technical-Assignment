import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

import { useStores } from "../../core/rootStore";
import { getCurrentLocation } from "../../services/locationService";
import PillButton from "../../components/PillButton/PillButton";
import { createRecordScreenStyles } from "./CreateRecordScreenStyles";

type PickedPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
};

const maxPhotos = 10;
const maxBytes = 5 * 1024 * 1024;

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

    currentUri = result.uri;
  }

  return { uri: currentUri, mimeType: "image/jpeg" };
}

async function getFileSizeBytes(uri: string): Promise<number> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob.size;
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

export const CreateRecordScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const router = useRouter();
  const { sessionStore, defectTypesStore, recordsStore } = useStores();

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
  const baseUrl = process.env.EXPO_PUBLIC_API_URL!;

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
      photos.length <= maxPhotos &&
      !submitting
    );
  }, [deviceId, defectType, photos.length, submitting]);

  const addAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    setPhotos((prev) => {
      const next = prev.slice();
      const before = next.length;

      for (const a of assets) {
        if (next.length >= maxPhotos) break;
        next.push({
          uri: a.uri,
          width: a.width,
          height: a.height,
          fileSize: (a as any).fileSize,
          mimeType: a.mimeType,
        });
      }

      const added = next.length - before;
      const skipped = assets.length - added;

      if (skipped > 0) {
        Alert.alert(
          t("common:info", { defaultValue: "Info" }),
          t("screens:create.maxPhotosReached", {
            defaultValue:
              "Bylo dosaženo limitu 10 fotek. Další byly přeskočeny.",
          })
        );
      }

      return next;
    });
  };

  const pickFromLibrary = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) {
      Alert.alert(
        t("screens:create.permissionTitle", { defaultValue: "Povolení" }),
        t("screens:create.permissionMedia", {
          defaultValue: "Je potřeba povolit přístup ke galerii.",
        })
      );
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
      Alert.alert(
        t("screens:create.permissionTitle", { defaultValue: "Povolení" }),
        t("screens:create.permissionCamera", {
          defaultValue: "Je potřeba povolit přístup ke kameře.",
        })
      );
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
      Alert.alert(
        t("common:error", { defaultValue: "Chyba" }),
        t("screens:create.validationMinPhotos", {
          defaultValue: "Je potřeba přidat alespoň 1 fotku.",
        })
      );
      return;
    }

    setSubmitting(true);

    try {
      const normalized: Array<{ uri: string; mimeType: string; size: number }> =
        [];

      for (const p of photos) {
        const { uri, mimeType } = await normalizeToJpeg(p.uri);
        const size = await getFileSizeBytes(uri);

        if (size > maxBytes) {
          throw new Error(
            t("screens:create.photoTooLarge", {
              defaultValue: "Jedna z fotek je po převodu větší než 5 MB.",
            })
          );
        }

        normalized.push({ uri, mimeType, size });
      }

      const form = new FormData();
      form.append("defectType", defectType);
      form.append("severity", String(severity));
      if (note.trim().length) form.append("note", note.trim());

      if (location) {
        form.append("lat", String(location.lat));
        form.append("lng", String(location.lng));
        if (location.accuracy != null) {
          form.append("locationAccuracy", String(location.accuracy));
        }
      }

      normalized.forEach((p, idx) => {
        form.append("photos", {
          uri: p.uri,
          name: `photo_${idx + 1}.jpg`,
          type: p.mimeType,
        } as any);
      });

      const resp = await fetch(`${baseUrl}/api/records`, {
        method: "POST",
        headers: { "x-device-id": deviceId },
        body: form,
      });

      const text = await resp.text();

      if (!resp.ok) {
        throw new Error(parseApiErrorMessage(text));
      }

      await recordsStore.loadFirstPage(deviceId);
      router.back();
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Chyba" }),
        e?.message ??
          t("screens:create.createFailed", {
            defaultValue: "Nepodařilo se vytvořit záznam.",
          })
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!deviceId) {
    return (
      <View className={createRecordScreenStyles.loadingCenter}>
        <ActivityIndicator />
        <Text className={createRecordScreenStyles.loadingText}>
          {t("common:loading")}
        </Text>
      </View>
    );
  }

  const defectOptions = defectTypesStore.items;

  const submitButtonClassName = [
    createRecordScreenStyles.submitButton.base,
    canSubmit
      ? createRecordScreenStyles.submitButton.enabled
      : createRecordScreenStyles.submitButton.disabled,
  ].join(" ");

  const submitTextClassName = canSubmit
    ? createRecordScreenStyles.submitText.enabled
    : createRecordScreenStyles.submitText.disabled;

  return (
    <View className={createRecordScreenStyles.screen}>
      <View className={createRecordScreenStyles.header}>
        <Text className={createRecordScreenStyles.title}>
          {t("screens:create.title", { defaultValue: "Nový záznam" })}
        </Text>

        <Pressable
          onPress={() => router.back()}
          className={createRecordScreenStyles.headerActionPressable}
        >
          <Text className={createRecordScreenStyles.headerActionText}>
            {t("common:close", { defaultValue: "Zavřít" })}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName={createRecordScreenStyles.content}>
        <Text className={createRecordScreenStyles.label}>
          {t("screens:create.defectType", { defaultValue: "Defekt" })}
        </Text>

        <View className={createRecordScreenStyles.listContainer}>
          {defectOptions.map((it, idx) => {
            const active = defectType === it.key;

            const itemClassName = [
              createRecordScreenStyles.listItem.base,
              idx === 0 ? "" : createRecordScreenStyles.listItem.divider,
              active
                ? createRecordScreenStyles.listItem.active
                : createRecordScreenStyles.listItem.inactive,
            ].join(" ");

            const itemTextClassName = [
              createRecordScreenStyles.listItemText.base,
              active
                ? createRecordScreenStyles.listItemText.active
                : createRecordScreenStyles.listItemText.inactive,
            ].join(" ");

            return (
              <Pressable
                key={it.key}
                onPress={() => setDefectType(it.key)}
                className={itemClassName}
              >
                <Text className={itemTextClassName}>
                  {t(`defects:${it.key}.label`, { defaultValue: it.key })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className={createRecordScreenStyles.sectionSpacer}>
          <Text className={createRecordScreenStyles.label}>
            {t("screens:create.severity", { defaultValue: "Závažnost (1–5)" })}
          </Text>

          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <PillButton
                key={n}
                label={String(n)}
                active={severity === n}
                onPress={() => setSeverity(n)}
              />
            ))}
          </View>
        </View>

        <View className={createRecordScreenStyles.sectionSpacer}>
          <Text className={createRecordScreenStyles.label}>
            {t("screens:create.note", { defaultValue: "Poznámka" })}
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t("screens:create.notePlaceholder", {
              defaultValue: "Volitelné…",
            })}
            placeholderTextColor="#71717a"
            className={createRecordScreenStyles.input}
            multiline
          />
        </View>

        <View className={createRecordScreenStyles.sectionSpacer}>
          <Text className={createRecordScreenStyles.label}>
            {t("screens:create.photos", { defaultValue: "Fotky" })} (
            {photos.length}/{maxPhotos})
          </Text>

          <View className={createRecordScreenStyles.photoButtonsRow}>
            <Pressable
              onPress={takePhoto}
              disabled={submitting}
              className={[
                createRecordScreenStyles.photoButton,
                submitting ? "opacity-50" : "",
              ].join(" ")}
            >
              <Text className={createRecordScreenStyles.photoButtonText}>
                {t("screens:create.takePhoto", {
                  defaultValue: "Sfotografovat",
                })}
              </Text>
            </Pressable>

            <Pressable
              onPress={pickFromLibrary}
              disabled={submitting}
              className={[
                createRecordScreenStyles.photoButton,
                submitting ? "opacity-50" : "",
              ].join(" ")}
            >
              <Text className={createRecordScreenStyles.photoButtonText}>
                {t("screens:create.pickFromGallery", {
                  defaultValue: "Vybrat z galerie",
                })}
              </Text>
            </Pressable>
          </View>

          {photos.length > 0 ? (
            <View className={createRecordScreenStyles.photoGrid}>
              {photos.map((p, idx) => (
                <Pressable
                  key={`${p.uri}-${idx}`}
                  onPress={() => removePhotoAt(idx)}
                  disabled={submitting}
                  className={[
                    createRecordScreenStyles.photoTile,
                    submitting ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <Image
                    source={{ uri: p.uri }}
                    className={createRecordScreenStyles.photoTileImage}
                    resizeMode="cover"
                  />

                  <View className={createRecordScreenStyles.removeBadge}>
                    <Text className={createRecordScreenStyles.removeBadgeText}>
                      ×
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text className={createRecordScreenStyles.gpsHint}>
            {location
              ? `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (±${
                  location.accuracy ?? "—"
                } m)`
              : "GPS: —"}
          </Text>

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            className={submitButtonClassName}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className={submitTextClassName}>
                {t("screens:create.submit", { defaultValue: "Odeslat" })}
              </Text>
            )}
          </Pressable>

          <Text className={createRecordScreenStyles.limitHint}>
            {t("screens:create.photoLimits", {
              defaultValue:
                "Limit: max 10 fotek, každá do 5 MB (po převodu do JPEG).",
            })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});
