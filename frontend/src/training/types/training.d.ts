import {NewExerciseTemplate} from "./exerciseTemplate";

export interface NewTrainingTemplate{

}

export interface TrainingTemplate extends NewExerciseTemplate{
  id: number,
}

export interface NewTraining{

}

export interface Training{
  id: number,
}