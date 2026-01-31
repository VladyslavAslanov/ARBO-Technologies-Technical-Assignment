export const recordsScreenStyles = {
  screen: "flex-1 pt-16 bg-white dark:bg-zinc-950",

  header: {
    container: "px-4 mb-3 flex-row items-center justify-between",
    title: "text-2xl font-semibold text-zinc-900 dark:text-zinc-100",
    actionsRow: "flex-row gap-2",
    iconButton:
      "h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60",
    iconText: "text-lg font-semibold text-zinc-900 dark:text-zinc-100",
  },

  error: {
    container: "px-4 mb-2",
    text: "text-zinc-900 dark:text-zinc-100",
  },

  empty: {
    container: "flex-1 items-center justify-center",
    text: "text-zinc-500 dark:text-zinc-400",
  },

  list: {
    contentContainerStyle: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    } as const,
    footerLoadingWrapper: "py-4",
  },

  card: {
    pressable: "mb-2.5",
    container:
      "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3",
    row: "flex-row gap-3",
    thumb: "w-[72px] h-[72px] rounded-xl bg-zinc-200 dark:bg-zinc-800",
    title: "font-semibold text-zinc-900 dark:text-zinc-100",
    meta: "mt-1 text-zinc-500 dark:text-zinc-400",
  },

  loading: {
    center: "flex-1 items-center justify-center",
    text: "mt-2 text-zinc-500 dark:text-zinc-400",
  },
};
