import * as Location from "expo-location";

export type LocationResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      accuracy: number | null;
    }
  | {
      ok: false;
      reason: "permission_denied" | "unavailable" | "timeout" | "error";
    };

export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return { ok: false, reason: "unavailable" };

    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted")
      return { ok: false, reason: "permission_denied" };

    // Fast first fix, then accept it as "good enough" for MVP.
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy:
        typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : null,
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}
