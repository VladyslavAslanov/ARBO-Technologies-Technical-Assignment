import { makeAutoObservable, runInAction } from "mobx";
import { apiGet } from "../services/api";
import type { DefectTypeItem } from "../services/types";

export class DefectTypesStore {
  items: DefectTypeItem[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load(deviceId: string) {
    if (this.loading) return;
    this.loading = true;
    this.error = null;

    try {
      const data = await apiGet<DefectTypeItem[]>(
        "/api/defect-types",
        deviceId
      );
      runInAction(() => {
        this.items = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? "Failed to load defect types";
        this.loading = false;
      });
    }
  }
}
