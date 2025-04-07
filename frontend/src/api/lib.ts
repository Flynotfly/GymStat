import {getCSRFToken} from "../utils.ts";

type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'TRACE';
const safeMethods: HTTPMethod[] = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

export const baseURL = import.meta.env.VITE_BASE_URL;

export function request(method: HTTPMethod, url: string, data?: object): Promise<any> {
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
  if (data !== undefined && method !== 'GET' && method !== 'HEAD') {
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
  return fetch(baseURL + 'user/' + 'csrf/', {
    credentials: "include"
  });
}