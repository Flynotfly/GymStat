export type NoteField =
  | "Text"
  | "Datetime"
  | "Duration"
  | "Number"
  | "5stars"
  | "10stars";

export interface Note {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Default?: string;
}

export interface NoteStringify {
  Name: string;
  Field: NoteField;
  Required: "True" | "False";
  Default?: string;
}

export type SetData = {
  [key: string]: string | number;
};

export interface Exercise {
  Template: number;
  Unit?: Record<string, string>;
  Sets?: SetData[];
}

export interface TrainingTemplateData {
  Notes?: Note[];
  Exercises?: Exercise[];
}

export interface TrainingTemplateDataStringify {
  Notes?: NoteStringify[];
  Exercises?: Exercise[]
}

export interface NewTrainingTemplate{
  name: string,
  description: string,
  data: TrainingTemplateData,
}

export interface TrainingTemplate extends NewTrainingTemplate{
  id: number,
}

export interface NewTrainingTemplateStringify{
  name: string,
  description: string,
  data: TrainingTemplateDataStringify,
}

export interface TrainingTemplateStringify extends NewTrainingTemplateStringify{
  id: number,
}