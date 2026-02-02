import { DefectType } from "@prisma/client";

export type DefectCategory = "CROWN" | "TRUNK" | "ROOTS" | "OTHER";

export const DEFECT_TYPES: Array<{
  key: DefectType;
  category: DefectCategory;
}> = [
  { key: DefectType.DEAD_WOOD, category: "CROWN" },
  { key: DefectType.CRACKS, category: "TRUNK" },
  { key: DefectType.WEAK_UNION_INCLUDED_BARK, category: "CROWN" },
  { key: DefectType.HEARTWOOD_DECAY, category: "TRUNK" },
  { key: DefectType.SAPWOOD_DAMAGE_DECAY, category: "TRUNK" },
  { key: DefectType.CAVITY_HOLLOW, category: "TRUNK" },
  { key: DefectType.CONKS_MUSHROOMS, category: "TRUNK" },
  { key: DefectType.CANKERS_GALLS_BURLS, category: "TRUNK" },
  { key: DefectType.ROOT_PROBLEMS, category: "ROOTS" },
  { key: DefectType.ROOT_PLATE_LIFTING, category: "ROOTS" },
  { key: DefectType.LEAN, category: "TRUNK" },
  { key: DefectType.POOR_ARCHITECTURE, category: "OTHER" },
  { key: DefectType.LIGHTNING_DAMAGE, category: "TRUNK" },
  { key: DefectType.SAP_OOZE, category: "TRUNK" },
];
