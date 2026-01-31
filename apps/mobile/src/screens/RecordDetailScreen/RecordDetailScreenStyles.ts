export const recordDetailScreenStyles = {
  loading: {
    center: "flex-1 items-center justify-center",
    text: "mt-2 text-zinc-500 dark:text-zinc-400",
  },

  screen: "flex-1 pt-16 bg-white dark:bg-zinc-950",

  header: {
    container: "px-4 mb-3 flex-row items-center justify-between",
    title: "text-2xl font-semibold text-zinc-900 dark:text-zinc-100",
    actionsRow: "flex-row gap-2",
    actionPressable: "px-3 py-2",
    actionText: "font-semibold text-zinc-900 dark:text-zinc-100",
  },

  error: {
    container: "flex-1 pt-16 px-4 bg-white dark:bg-zinc-950",
    text: "mt-4 text-zinc-900 dark:text-zinc-100",
  },

  body: {
    content: "px-4 pb-6",
  },

  text: {
    primary: "font-semibold text-zinc-900 dark:text-zinc-100",
    meta: "mt-1.5 text-zinc-500 dark:text-zinc-400",
    sectionLabel: "text-zinc-500 dark:text-zinc-400",
    emptyPhotos: "text-zinc-500 dark:text-zinc-400",
  },

  section: {
    wrapper: "mt-4",
    noteTextSpacing: "mt-1",
  },

  photos: {
    emptyContainer:
      "mt-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3",

    card: "mt-2.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
    image: "w-full h-[220px] bg-zinc-200 dark:bg-zinc-800",
    footer: "px-3 py-2",
    path: "text-xs text-zinc-500 dark:text-zinc-400",
  },
};
