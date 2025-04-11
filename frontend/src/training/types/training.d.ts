export interface NewExerciseTemplate{
  name: string,
  fields: string[],
  description: string,
}

export interface ExerciseTemplate extends NewExerciseTemplate{
  id: number,
  is_admin: boolean,
}

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