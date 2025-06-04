import {Dayjs} from "dayjs";

import {NoteField} from "./trainingTemplate";

export interface TrainingNote{
  Name: string;
  Field: NoteField;
  Required: boolean;
  Value: string;
}

export type ExerciseUnit = Record<string, string>;

export type ExerciseSet = Record<string, string | number>;

export interface Exercise{
  template: number;
  order: number;
  units?: ExerciseUnit;
  sets?: ExerciseSet[];
}

export interface NewTraining {
  conducted: Dayjs;
  title: string;
  template?: number;
  description?: string;
  notes: TrainingNote[];
  exercises: Exercise[];
}

export interface Training extends NewTraining{
  id: number;
  owner: number;
}

export interface TrainingNoteStringify extends TrainingNote{
  Required: "True" | "False";
}

export interface NewTrainingStringify extends NewTraining{
  conducted: string;
  notes: TrainingNoteStringify[];
}

export interface TrainingStringify extends NewTrainingStringify{
  id: number;
  owner: number;
}
