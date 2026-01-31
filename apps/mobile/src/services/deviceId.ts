import * as SecureStore from "expo-secure-store";

const KEY = "deviceId";

function fallbackId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;

  const id = globalThis.crypto?.randomUUID?.() ?? fallbackId();
  await SecureStore.setItemAsync(KEY, id);
  return id;
}
