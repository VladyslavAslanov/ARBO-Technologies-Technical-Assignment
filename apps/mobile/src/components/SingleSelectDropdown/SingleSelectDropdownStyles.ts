export const singleSelectDropdownStyles = {
  trigger: {
    container:
      "flex-1 flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900",
    label: "font-semibold text-zinc-900 dark:text-zinc-100",
    value: "text-zinc-500 dark:text-zinc-400",
  },

  modal: {
    container: "flex-1 bg-white pt-16 dark:bg-zinc-950",
    header:
      "flex-row items-center justify-between border-b border-zinc-200 px-4 pb-3 dark:border-zinc-800",
    title: "text-lg font-semibold text-zinc-900 dark:text-zinc-100",
    closePressable: "px-3 py-2",
    closeText: "font-semibold text-zinc-900 dark:text-zinc-100",
  },

  list: {
    content: "p-4",
  },

  option: {
    pressable:
      "mb-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900",
    text: "font-semibold text-zinc-900 dark:text-zinc-100",
  },
};
