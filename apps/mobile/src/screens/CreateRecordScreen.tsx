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

import { useStores } from "../core/rootStore";
import { getCurrentLocation } from "../services/locationService";
import PillButton from "../components/PillButton";

type PickedPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
};

const maxPhotos = 10;
const maxBytes = 5 * 1024 * 1024;

const loadingCenterClassName = "flex-1 items-center justify-center";
const loadingTextClassName = "mt-2 text-zinc-500 dark:text-zinc-400";

const screenClassName = "flex-1 pt-16 bg-white dark:bg-zinc-950";

const headerClassName = "px-4 mb-3 flex-row items-center justify-between";
const titleClassName =
  "text-2xl font-semibold text-zinc-900 dark:text-zinc-100";

const headerActionPressableClassName = "px-3 py-2";
const headerActionTextClassName =
  "font-semibold text-zinc-900 dark:text-zinc-100";

const contentClassName = "p-4 pb-6";

const labelClassName = "mb-1.5 text-zinc-500 dark:text-zinc-400";
const sectionSpacerClassName = "mt-4";

const listContainerClassName =
  "rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900";

const listItemBaseClassName = "px-3 py-3";
const listItemDividerClassName =
  "border-t border-zinc-200 dark:border-zinc-800";
const listItemActiveClassName = "bg-zinc-900 dark:bg-zinc-100";
const listItemInactiveClassName = "bg-transparent";

const listItemTextBaseClassName = "font-semibold";
const listItemTextActiveClassName = "text-white dark:text-zinc-900";
const listItemTextInactiveClassName = "text-zinc-900 dark:text-zinc-100";

const inputClassName =
  "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 text-zinc-900 dark:text-zinc-100";

const photoButtonsRowClassName = "flex-row gap-2.5";
const photoButtonClassName =
  "flex-1 items-center rounded-xl border border-zinc-900 dark:border-zinc-100 py-3";
const photoButtonTextClassName =
  "font-semibold text-zinc-900 dark:text-zinc-100";

const photoGridClassName = "mt-3 flex-row flex-wrap gap-2.5";

const photoTileClassName =
  "w-[110px] h-[110px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800";

const photoTileImageClassName = "w-full h-full";

const removeBadgeClassName =
  "absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5";
const removeBadgeTextClassName = "text-white font-semibold text-xs";

const gpsHintClassName = "mt-2 text-xs text-zinc-500 dark:text-zinc-400";

const submitButtonBaseClassName = "mt-4 rounded-xl py-3.5 items-center";
const submitButtonEnabledClassName = "bg-zinc-900 dark:bg-zinc-100";
const submitButtonDisabledClassName = "bg-zinc-200 dark:bg-zinc-800";

const submitTextEnabledClassName =
  "font-semibold text-white dark:text-zinc-900";
const submitTextDisabledClassName =
  "font-semibold text-zinc-500 dark:text-zinc-400";

const limitHintClassName = "mt-2 text-xs text-zinc-500 dark:text-zinc-400";

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
      if (!resp.ok)
        throw new Error(text || `Upload failed with ${resp.status}`);

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
      <View className={loadingCenterClassName}>
        <ActivityIndicator />
        <Text className={loadingTextClassName}>{t("common:loading")}</Text>
      </View>
    );
  }

  const defectOptions = defectTypesStore.items;

  const submitButtonClassName = [
    submitButtonBaseClassName,
    canSubmit ? submitButtonEnabledClassName : submitButtonDisabledClassName,
  ].join(" ");

  const submitTextClassName = canSubmit
    ? submitTextEnabledClassName
    : submitTextDisabledClassName;

  return (
    <View className={screenClassName}>
      <View className={headerClassName}>
        <Text className={titleClassName}>
          {t("screens:create.title", { defaultValue: "Nový záznam" })}
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
          {t("screens:create.defectType", { defaultValue: "Defekt" })}
        </Text>

        <View className={listContainerClassName}>
          {defectOptions.map((it, idx) => {
            const active = defectType === it.key;

            const itemClassName = [
              listItemBaseClassName,
              idx === 0 ? "" : listItemDividerClassName,
              active ? listItemActiveClassName : listItemInactiveClassName,
            ].join(" ");

            const itemTextClassName = [
              listItemTextBaseClassName,
              active
                ? listItemTextActiveClassName
                : listItemTextInactiveClassName,
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

        <View className={sectionSpacerClassName}>
          <Text className={labelClassName}>
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

        <View className={sectionSpacerClassName}>
          <Text className={labelClassName}>
            {t("screens:create.note", { defaultValue: "Poznámka" })}
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t("screens:create.notePlaceholder", {
              defaultValue: "Volitelné…",
            })}
            placeholderTextColor="#71717a"
            className={inputClassName}
            multiline
          />
        </View>

        <View className={sectionSpacerClassName}>
          <Text className={labelClassName}>
            {t("screens:create.photos", { defaultValue: "Fotky" })} (
            {photos.length}/{maxPhotos})
          </Text>

          <View className={photoButtonsRowClassName}>
            <Pressable onPress={takePhoto} className={photoButtonClassName}>
              <Text className={photoButtonTextClassName}>
                {t("screens:create.takePhoto", {
                  defaultValue: "Sfotografovat",
                })}
              </Text>
            </Pressable>

            <Pressable
              onPress={pickFromLibrary}
              className={photoButtonClassName}
            >
              <Text className={photoButtonTextClassName}>
                {t("screens:create.pickFromGallery", {
                  defaultValue: "Vybrat z galerie",
                })}
              </Text>
            </Pressable>
          </View>

          {photos.length > 0 ? (
            <View className={photoGridClassName}>
              {photos.map((p, idx) => (
                <Pressable
                  key={`${p.uri}-${idx}`}
                  onPress={() => removePhotoAt(idx)}
                  className={photoTileClassName}
                >
                  <Image
                    source={{ uri: p.uri }}
                    className={photoTileImageClassName}
                    resizeMode="cover"
                  />

                  <View className={removeBadgeClassName}>
                    <Text className={removeBadgeTextClassName}>×</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text className={gpsHintClassName}>
            {location
              ? `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (±${location.accuracy ?? "—"} m)`
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

          <Text className={limitHintClassName}>
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
