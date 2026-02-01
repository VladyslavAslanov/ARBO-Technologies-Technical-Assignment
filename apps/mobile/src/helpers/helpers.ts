import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

export async function ensureMediaPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

export async function getFileSizeBytes(uri: string): Promise<number> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob.size;
}

export async function normalizeToJpeg(
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

export function parseApiErrorMessage(raw: string): string {
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

export function resolvePhotoUrl(baseUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path}`;
}
