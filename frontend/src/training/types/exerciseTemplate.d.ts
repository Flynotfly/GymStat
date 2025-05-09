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
export type ExerciseTemplateTypeChoose = 'all' | 'onlyMy' | 'exceptMy';

export type ExerciseTemplateTag =
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
  | "pilates";
