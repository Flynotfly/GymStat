export const ALLOWED_EXERCISE_FIELDS = {
  sets: "int",
  reps: "int",
  weight: ["float", ["kg", "lbs"]],
  time: "duration",
  distance: ["float", ["m", "km", "mi"]],
  speed: ["float", ["kph", "mph", "mps"]],
  rounds: "int",
  rest: "duration",
  rpe: "int",
  attempts: "int",
  successes: "int",
  notes: "text",
  tempo: "text",
} as const;

export type AllowedFieldName = keyof typeof ALLOWED_EXERCISE_FIELDS;
