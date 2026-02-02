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
  days: 7 | 14 | 30 | null;
  hasMore: boolean;
};

export class RecordsStore {
  items: RecordListItem[] = [];
  loading = false;
  error: string | null = null;
  selectedDefectTypes: string[] = [];
  minSeverity: number | null = null;
  maxSeverity: number | null = null;

  // Paging
  limit = 20;
  offset = 0;
  days: 7 | 14 | 30 | null = null;
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

  setDays(days: 7 | 14 | 30 | null) {
    if (this.days === days) return;
    this.days = days;
  }

  setSortBy(sortBy: "createdAt" | "severity") {
    this.sortBy = sortBy;
  }

  toggleOrder() {
    this.order = this.order === "desc" ? "asc" : "desc";
  }

  setSelectedDefectTypes(keys: string[]) {
    this.selectedDefectTypes = keys;
  }

  setMinSeverity(v: number | null) {
    this.minSeverity = v;
    // Keep range consistent
    if (
      this.minSeverity != null &&
      this.maxSeverity != null &&
      this.minSeverity > this.maxSeverity
    ) {
      this.maxSeverity = this.minSeverity;
    }
  }

  setMaxSeverity(v: number | null) {
    this.maxSeverity = v;
    // Keep range consistent
    if (
      this.minSeverity != null &&
      this.maxSeverity != null &&
      this.minSeverity > this.maxSeverity
    ) {
      this.minSeverity = this.maxSeverity;
    }
  }

  clearSeverity() {
    this.minSeverity = null;
    this.maxSeverity = null;
  }

  toggleDefectType(key: string) {
    if (this.selectedDefectTypes.includes(key)) {
      this.selectedDefectTypes = this.selectedDefectTypes.filter(
        (x) => x !== key
      );
    } else {
      this.selectedDefectTypes = this.selectedDefectTypes.concat(key);
    }
  }

  clearDefectTypes() {
    this.selectedDefectTypes = [];
  }

  resetFilters() {
    this.selectedDefectTypes = [];
    this.days = 30;
    this.sortBy = "createdAt";
    this.order = "desc";
    this.minSeverity = null;
    this.maxSeverity = null;
  }

  private buildQuery() {
    const params = new URLSearchParams();
    if (this.days != null) {
      params.set("days", String(this.days));
    }
    params.set("limit", String(this.limit));
    params.set("offset", String(this.offset));
    params.set("sortBy", this.sortBy);
    params.set("order", this.order);

    if (this.minSeverity != null)
      params.set("minSeverity", String(this.minSeverity));
    if (this.maxSeverity != null)
      params.set("maxSeverity", String(this.maxSeverity));

    for (const dt of this.selectedDefectTypes) {
      params.append("defectType", dt);
    }

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
