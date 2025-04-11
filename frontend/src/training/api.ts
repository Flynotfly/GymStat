import {baseURL, request} from "../core/api.ts";
import {
  ExerciseTemplate,
  NewExerciseTemplate,
  NewTraining,
  NewTrainingTemplate,
  Training,
  TrainingTemplate
} from "./types/training";
import {PaginatedResponse} from "../types/api";

const TRAINING_BASE_URL = baseURL + 'training/';

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
): Promise<PaginatedResponse<ExerciseTemplate>> {
  return request('GET',
    URLs['EXERCISE_TEMPLATES'] + '?page=' + page + '&type=' + template_type,
  )
}

export function createExerciseTemplate(
  exerciseTemplate: NewExerciseTemplate,
): Promise<ExerciseTemplate> {
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
): Promise<void> {
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
): Promise<PaginatedResponse<TrainingTemplate>> {
  return request(
    'GET',
    URLs['TRAINING_TEMPLATES'] + '?page=' + page,
  )
}

export function createTrainingTemplate(
  trainingTemplate: NewTrainingTemplate
): Promise<TrainingTemplate> {
  return request(
    'POST',
    URLs['TRAINING_TEMPLATES'],
    trainingTemplate,
  )
}

export function editTrainingTemplate(
  trainingTemplate: TrainingTemplate
): Promise<TrainingTemplate> {
  const { id } = trainingTemplate;
  return request(
    'PUT',
    URLs['TRAINING_TEMPLATES'] + id + '/',
    trainingTemplate,
  )
}

export function deleteTrainingTemplate(
  id: number
): Promise<void> {
  return request(
    'DELETE',
    URLs['TRAINING_TEMPLATES'] + id + '/',
  )
}

///////////////
// Trainings //
///////////////

export function getTrainings(
  page: number = 1
): Promise<PaginatedResponse<Training>> {
  return request(
    'GET',
    URLs['TRAININGS'] + '?page=' + page,
  )
}

export function createTraining(
  training: NewTraining
): Promise<Training> {
  return request(
    'POST',
    URLs['TRAININGS'],
    training,
  )
}

export function editTraining(
  training: Training
): Promise<Training> {
  const { id } = training;
  return request(
    'PUT',
    URLs['TRAININGS'] + id + '/',
    training
  )
}

export function deleteTraining(
  id: number
): Promise<void> {
  return request(
    'DELETE',
    URLs['TRAININGS'] + id + '/',
  )
}
