export interface NewExerciseTemplate{

}

export interface ExerciseTemplate extends NewExerciseTemplate{
  id: number,
}

export interface NewTrainingTemplate{

}

export interface TrainingTemplate extends NewExerciseTemplate{
  id: number,
}