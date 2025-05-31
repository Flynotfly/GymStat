import {NoteField} from "./trainingTemplate";

export interface TrainingNote{
  Name: string;
  Field: NoteField;
  Required: boolean;
  Value: string;
}

export interface ExerciseUnit{
  weight?: "kg" | "lbs";
  distance?: "m" | "km" | "mi";
  speed?: "kph" | "mph" | "mps";
}

export interface ExerciseSet {
  sets?: number;
  reps?: number;
  weight?: number;
  time?: string;
  distance?: number;
  speed?: number;
  rounds?: number;
  rest?: string;
  rpe?: number;
  attempts?: number;
  successes?: number;
  notes?: string;
  tempo?: string;
}

export interface Exercise{
  template: number;
  order: number;
  units?: ExerciseUnit;
  sets?: ExerciseSet[];
}

export interface NewTraining {
  conducted: Date;
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
