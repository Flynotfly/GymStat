import {getCSRFToken} from "./utils.ts";

const baseURL = import.meta.env.VITE_BASE_URL;
const userAPIURL = `${baseURL}user/api/`;
const trainingAPIURL = `${baseURL}training/api/`;

function postRequest(url: string, data: object): Promise<any>{
  return fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken() ?? '',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.detail || 'Post data failed');
      });
    }
    return response.json();
  });
}

function getRequest(url: string): Promise<any>{
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.detail || 'Fetch data failed');
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
  return getRequest(`${trainingAPIURL}all-trainings/`);
}

export function getTraining(pk: number): Promise<any> {
  return getRequest(`${trainingAPIURL}training/${pk}/`);
}

export function getUserExercises(): Promise<any> {
  return getRequest(`${trainingAPIURL}my-exercises/`);
}

export function getBaseExercises(): Promise<any> {
  return getRequest(`${trainingAPIURL}base-exercises/`);
}

export function getAllExercises(): Promise<any> {
  return getRequest(`${trainingAPIURL}exercises/`);
}

export function createExercise(data: object): Promise<any> {
  return postRequest(`${trainingAPIURL}create-exercise-type/`, data);
}
