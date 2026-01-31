const baseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not set");
}

export async function apiGet<T>(path: string, deviceId: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "x-device-id": deviceId,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Request failed with ${res.status}`);
  }

  return JSON.parse(text) as T;
}
