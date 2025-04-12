export interface NewExerciseTemplate {
  name: string,
  fields: string[],
  tags: ExerciseTemplateTag[],
  description: string,
}

export interface ExerciseTemplate extends NewExerciseTemplate {
  id: number,
  is_admin: boolean,
}

export type ExerciseTemplateType = 'user' | 'admin' | null;

type ExerciseTemplateTag =
  "chest"
  | "biceps"
  | "cardio"
  | "cycling"
  | "running"
  | "free weight"
  | "machine"
  | "triceps"
  | "legs"
  | "back"
  | "shoulders"
  | "abs"
  | "core"
  | "HIIT"
  | "yoga"
  | "pilates"
  | "stretching"
  | "balance"
  | "functional training"
  | "sprints"
  | "resistance"
  | "endurance"
  | "circuit training"
  | "plyometrics"
  | "calisthenics"
  | "glutes"
  | "hamstrings"
  | "quads"
  | "obliques"
  | "warmup"
  | "cooldown"
  | "recovery"
  | "flexibility"
  | "isolation"
  | "compound";
