export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DEFAULT_ROWS = [
  { time: "8:00 - 10:00", cells: Array(7).fill("") },
  { time: "10:00 - 12:00", cells: Array(7).fill("") },
  { time: "13:00 - 15:00", cells: Array(7).fill("") },
  { time: "15:00 - 17:00", cells: Array(7).fill("") },
];
