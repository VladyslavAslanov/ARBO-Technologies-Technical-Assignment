import { makeAutoObservable, runInAction } from "mobx";
import { getOrCreateDeviceId } from "../services/deviceId";

export class SessionStore {
  deviceId: string | null = null;
  isReady = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    try {
      const id = await getOrCreateDeviceId();
      runInAction(() => {
        this.deviceId = id;
        this.isReady = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? "Failed to init session";
        this.isReady = true;
      });
    }
  }
}
