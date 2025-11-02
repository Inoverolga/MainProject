export const CUSTOM_ID_PART_TYPES = {
  FIXED: "fixed",
  RANDOM_20: "random20",
  RANDOM_32: "random32",
  RANDOM_6DIGIT: "random6digit",
  RANDOM_9DIGIT: "random9digit",
  GUID: "guid",
  DATETIME: "datetime",
  SEQUENCE: "sequence",
};

export const CUSTOM_ID_PART_LABELS = {
  [CUSTOM_ID_PART_TYPES.FIXED]: "Фиксированный текст",
  [CUSTOM_ID_PART_TYPES.RANDOM_20]: "Случайное число (до 1 млн)",
  [CUSTOM_ID_PART_TYPES.RANDOM_32]: "Случайное число (до 4 млрд)",
  [CUSTOM_ID_PART_TYPES.RANDOM_6DIGIT]: "6-значное случайное число",
  [CUSTOM_ID_PART_TYPES.RANDOM_9DIGIT]: "9-значное случайное число",
  [CUSTOM_ID_PART_TYPES.GUID]: "Уникальный ID (GUID)",
  [CUSTOM_ID_PART_TYPES.DATETIME]: "Текущая дата",
  [CUSTOM_ID_PART_TYPES.SEQUENCE]: "Порядковый номер",
};

export const DEFAULT_SEPARATORS = ["", "_", "-", ".", "/"];
