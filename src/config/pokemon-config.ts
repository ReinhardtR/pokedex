export const LAST_POKEMON_ID = 493; // Gen 4

export const STAT_DISPLAY_NAMES = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
} as const;
export type StatName = keyof typeof STAT_DISPLAY_NAMES;

// Defines the maximum value of the scale, used by the display progress bars.
export const STATS_SCALE = 255;
export const BASE_EXP_SCALE = 255;
export const WEIGHT_SCALE = 3980; // 398 kg (Wailord)
export const HEIGHT_SCALE = 145; // 14.5m (Wailord)
