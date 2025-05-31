import {baseURL, request} from "../core/api.ts";
import {
  NewTrainingStringify,
  TrainingStringify
} from "./types/training";
import {TrainingTemplate, NewTrainingTemplateStringify} from "./types/trainingTemplate"
import {PaginatedResponse} from "../types/api";
import {
  ExerciseTemplate,
  ExerciseTemplateTag,
  ExerciseTemplateType,
  NewExerciseTemplate
} from "./types/exerciseTemplate";

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
  search?: string,
  template_type?: ExerciseTemplateType,
  tags?: ExerciseTemplateTag[],
): Promise<PaginatedResponse<ExerciseTemplate>> {
  let url = URLs['EXERCISE_TEMPLATES'] + '?page=' + page;
  if (search) {
    url = url + '&search=' + search;
  }
  if (template_type) {
    url = url + '&type=' + template_type;
  }
  if (tags && tags.length > 0) {
    url = url + '&tags=' + tags.join(',');
  }

  return request('GET', url)
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
  trainingTemplate: NewTrainingTemplateStringify
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
): Promise<PaginatedResponse<TrainingStringify>> {
  return request(
    'GET',
    URLs['TRAININGS'] + '?page=' + page,
  )
}

export function createTraining(
  training: NewTrainingStringify
): Promise<TrainingStringify> {
  return request(
    'POST',
    URLs['TRAININGS'],
    training,
  )
}

export function editTraining(
  training: TrainingStringify
): Promise<TrainingStringify> {
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
