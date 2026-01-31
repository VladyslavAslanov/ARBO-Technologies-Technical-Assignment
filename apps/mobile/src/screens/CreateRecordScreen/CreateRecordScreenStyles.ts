export const createRecordScreenStyles = {
  loadingCenter: "flex-1 items-center justify-center",
  loadingText: "mt-2 text-zinc-500 dark:text-zinc-400",

  screen: "flex-1 pt-16 bg-white dark:bg-zinc-950",

  header: "px-4 mb-3 flex-row items-center justify-between",
  title: "text-2xl font-semibold text-zinc-900 dark:text-zinc-100",

  headerActionPressable: "px-3 py-2",
  headerActionText: "font-semibold text-zinc-900 dark:text-zinc-100",

  content: "p-4 pb-6",

  label: "mb-1.5 text-zinc-500 dark:text-zinc-400",
  sectionSpacer: "mt-4",

  listContainer:
    "rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900",

  listItem: {
    base: "px-3 py-3",
    divider: "border-t border-zinc-200 dark:border-zinc-800",
    active: "bg-zinc-200 dark:bg-zinc-800",
    inactive: "bg-transparent",
  },

  listItemText: {
    base: "font-semibold",
    active: "text-dark dark:text-zinc-200",
    inactive: "text-zinc-900 dark:text-zinc-100",
  },

  input:
    "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 text-zinc-900 dark:text-zinc-100",

  photoButtonsRow: "flex-row gap-2.5",
  photoButton:
    "flex-1 items-center rounded-xl border border-zinc-900 dark:border-zinc-100 py-3",
  photoButtonText: "font-semibold text-zinc-900 dark:text-zinc-100",

  photoGrid: "mt-3 flex-row flex-wrap gap-2.5",

  photoTile:
    "w-[110px] h-[110px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800",
  photoTileImage: "w-full h-full",

  removeBadge:
    "absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5",
  removeBadgeText: "text-white font-semibold text-xs",

  gpsHint: "mt-2 text-xs text-zinc-500 dark:text-zinc-400",

  submitButton: {
    base: "mt-4 rounded-xl py-3.5 items-center",
    enabled: "bg-zinc-900 dark:bg-zinc-100",
    disabled: "bg-zinc-200 dark:bg-zinc-800",
  },

  submitText: {
    enabled: "font-semibold text-white dark:text-zinc-900",
    disabled: "font-semibold text-zinc-500 dark:text-zinc-400",
  },

  limitHint: "mt-2 text-xs text-zinc-500 dark:text-zinc-400",
};
