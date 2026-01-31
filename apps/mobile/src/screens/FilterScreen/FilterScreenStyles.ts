export const filterScreenStyles = {
  screen: "flex-1 pt-16 bg-white dark:bg-zinc-950",

  header: "px-4 mb-3 flex-row items-center justify-between",
  title: "text-2xl font-semibold text-zinc-900 dark:text-zinc-100",

  headerAction: {
    pressable: "px-3 py-2",
    text: "font-semibold text-zinc-900 dark:text-zinc-100",
  },

  content: "px-4 pb-6",
  label: "mb-1.5 text-zinc-500 dark:text-zinc-400",

  section: {
    spacer: "mt-4",
  },

  row: {
    base: "flex-row",
    gap: "flex-row gap-2.5",
  },

  resetButton: {
    wrapper: "mt-6",
    pressable:
      "mt-6 items-center rounded-xl border border-zinc-300 dark:border-zinc-700 py-3",
    text: "font-semibold text-zinc-900 dark:text-zinc-100",
  },
};
