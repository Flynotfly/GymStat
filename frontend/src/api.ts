import {getCSRFToken} from "./utils.ts";
import {TrainingInterface} from "./pages/Training.tsx";

type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'TRACE';

const baseURL = import.meta.env.VITE_BASE_URL;
const userAPIURL = `${baseURL}user/api/`;
const trainingAPIURL = `${baseURL}training/api/`;

const safeMethods: HTTPMethod[] = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

function request(method: HTTPMethod, url: string, data?: object): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!safeMethods.includes(method)) {
    headers['X-CSRFToken'] = getCSRFToken() ?? '';
  }
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.detail || 'API request failed');
      });
    }
    return response.json();
  });
}

export function fetchCsrf(): Promise<any> {
  return fetch(`${userAPIURL}csrf/`, {
    credentials: "include"
  });
}

export function getAllTrainings(): Promise<any> {
  return request('GET', `${trainingAPIURL}trainings/`);
}

export function getTraining(pk: number): Promise<any> {
  return request('GET', `${trainingAPIURL}trainings/${pk}/`);
}

export function getUserExercises(): Promise<any> {
  return request('GET', `${trainingAPIURL}exercises/my/`);
}

export function getBaseExercises(): Promise<any> {
  return request('GET', `${trainingAPIURL}exercises/base/`);
}

export function getAllExercises(): Promise<any> {
  return request('GET', `${trainingAPIURL}exercises/`);
}

export function createExercise(data: object): Promise<any> {
  return request('POST', `${trainingAPIURL}exercises/create/`, data);
}

export function createTraining(data: Partial<TrainingInterface>): Promise<any> {
  return request('POST', `${trainingAPIURL}trainings/create/`, data);
}

export function updateTraining(data: Partial<TrainingInterface>): Promise<any> {
  const id = data.id;
  return request('PUT', `${trainingAPIURL}trainings/update/${id}/`, data);
}