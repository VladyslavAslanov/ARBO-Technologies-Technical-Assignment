import { makeAutoObservable, runInAction } from "mobx";
import { apiGet } from "../services/api";

export type DefectTypeKey = string;

export type RecordListItem = {
  id: string;
  defectType: DefectTypeKey;
  severity: number;
  note: string | null;
  lat: number | null;
  lng: number | null;
  locationAccuracy: number | null;
  recordedAt: string | null; // ISO
  createdAt: string; // ISO
  coverPhotoPath: string | null;
  photosCount: number;
};

export type ListRecordsResponse = {
  items: RecordListItem[];
  total: number;
  limit: number;
  offset: number;
  days: 7 | 14 | 30;
  hasMore: boolean;
};

export class RecordsStore {
  items: RecordListItem[] = [];
  loading = false;
  error: string | null = null;

  // Paging
  limit = 20;
  offset = 0;
  days: 7 | 14 | 30 = 30;
  hasMore = true;

  // Sort defaults match backend
  sortBy: "createdAt" | "severity" = "createdAt";
  order: "asc" | "desc" = "desc";

  constructor() {
    makeAutoObservable(this);
  }

  reset() {
    this.items = [];
    this.offset = 0;
    this.hasMore = true;
    this.error = null;
  }

  setDays(days: 7 | 14 | 30) {
    if (this.days === days) return;
    this.days = days;
  }
  setSortBy(sortBy: "createdAt" | "severity") {
    this.sortBy = sortBy;
  }

  toggleOrder() {
    this.order = this.order === "desc" ? "asc" : "desc";
  }

  private buildQuery() {
    const params = new URLSearchParams();
    params.set("days", String(this.days));
    params.set("limit", String(this.limit));
    params.set("offset", String(this.offset));
    params.set("sortBy", this.sortBy);
    params.set("order", this.order);
    return params.toString();
  }

  async applyAndReload(deviceId: string) {
    await this.loadFirstPage(deviceId);
  }

  async loadFirstPage(deviceId: string) {
    this.reset();
    await this.loadNextPage(deviceId);
  }

  async loadNextPage(deviceId: string) {
    if (this.loading) return;
    if (!this.hasMore) return;

    this.loading = true;
    this.error = null;

    try {
      const qs = this.buildQuery();
      const data = await apiGet<ListRecordsResponse>(
        `/api/records?${qs}`,
        deviceId
      );

      runInAction(() => {
        this.items = this.items.concat(data.items);
        this.offset = data.offset + data.items.length;
        this.hasMore = data.hasMore;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? "Failed to load records";
        this.loading = false;
      });
    }
  }
}
