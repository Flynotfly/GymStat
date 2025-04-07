import {baseURL, request} from "./lib.ts";
import {ExerciseTemplate, NewExerciseTemplate, NewTrainingTemplate, TrainingTemplate} from "../training/types/training";

const TRAINING_BASE_URL = {baseURL} + 'training/';

const URLs = Object.freeze({
  EXERCISE_TEMPLATES: TRAINING_BASE_URL + 'exercises/',
  TRAINING_TEMPLATES: TRAINING_BASE_URL + 'trainings/templates/',
  TRAININGS: TRAINING_BASE_URL + 'trainings/'
})

////////////////////////
// Exercise templates //
////////////////////////

export function getExerciseTemplates(
  page: number = 1,
  template_type: string = 'all',
): Promise<any> {
  return request('GET',
    URLs['EXERCISE_TEMPLATES'] + '?page=' + page + '&type=' + template_type,
  )
}

export function createExerciseTemplate(
  exerciseTemplate: NewExerciseTemplate,
): Promise<any> {
  return request(
    'POST',
    URLs['EXERCISE_TEMPLATES'],
    exerciseTemplate
  )
}

export function editExerciseTemplate(
  exerciseTemplate: ExerciseTemplate,
): Promise<ExerciseTemplate> {
  const { id } = exerciseTemplate;
  return request(
    'PUT',
    URLs['EXERCISE_TEMPLATES'] + id + '/',
    exerciseTemplate,
  )
}

export function deleteExerciseTemplate(
  id: number,
): Promise<any> {
  return request(
    'DELETE',
    URLs['EXERCISE_TEMPLATES'] + id + '/',
  )
}

////////////////////////
// Training templates //
////////////////////////

export function getTrainingTemplates(
  page: number = 1
): Promise<any> {
  return request(
    'GET',
    URLs['TRAINING_TEMPLATES'] + '?page' + page,
  )
}

export function createTrainingTemplate(
  trainingTemplate: NewTrainingTemplate
): Promise<any> {
  return request(
    'POST',
    URLs['TRAINING_TEMPLATES'],
    trainingTemplate,
  )
}

export function editTrainingTemplate(
  trainingTemplate: TrainingTemplate
): Promise<any> {
  const { id } = trainingTemplate;
  return request(
    'PUT',
    URLs['TRAINING_TEMPLATES'] + id + '/',
    trainingTemplate,
  )
}

export function deleteTrainingTemplate(
  id: number
): Promise<any> {
  return request(
    'DELETE',
    URLs['TRAINING_TEMPLATES'] + id + '/',
  )
}

///////////////
// Trainings //
///////////////


// export function getAllTrainings(): Promise<any> {
//   return request('GET', URL + 'trainings/');
// }
//
// export function getTraining(pk: number): Promise<any> {
//   return request('GET', `${URL}trainings/${pk}/`);
// }
//
// export function getUserExercises(): Promise<any> {
//   return request('GET', `${URL}exercises/my/`);
// }
//
// export function getBaseExercises(): Promise<any> {
//   return request('GET', `${URL}exercises/base/`);
// }
//
// export function getAllExercises(): Promise<any> {
//   return request('GET', `${URL}exercises/`);
// }
//
// export function createExercise(data: object): Promise<any> {
//   return request('POST', `${URL}exercises/create/`, data);
// }
//
// export function createTraining(data: Partial<TrainingInterface>): Promise<any> {
//   return request('POST', `${URL}trainings/create/`, data);
// }
//
// export function updateTraining(data: Partial<TrainingInterface>): Promise<any> {
//   const id = data.id;
//   return request('PUT', `${URL}trainings/update/${id}/`, data);
// }