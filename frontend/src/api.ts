const baseURL = import.meta.env.VITE_BASE_URL;
const userAPIURL = `${baseURL}user/api/`;
const trainingAPIURL = `${baseURL}training/api/`;

export function fetchCsrf(): Promise<any> {
  return fetch(`${userAPIURL}csrf/`, {
    credentials: "include"
  });
}

export function APILogin(csrfToken: string, username: string, password: string): Promise<any> {
  return fetch(`${userAPIURL}login/`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify({ username, password}),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        // Optionally, you can check errorData for more details.
        throw new Error(errorData.detail || 'Login failed');
      });
    }
    return response.json();
  });
}

export function getAllTrainings(): Promise<any> {
  return fetch(`${trainingAPIURL}all-trainings/?exercise_type=1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        // Optionally, you can check errorData for more details.
        throw new Error(errorData.detail || 'Fetch training failed');
      });
    }
    return response.json();
  });
}

export function getUserExercises(): Promise<any> {
  return fetch(`${trainingAPIURL}my-exercises/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        // Optionally, you can check errorData for more details.
        throw new Error(errorData.detail || 'Fetch training failed');
      });
    }
    return response.json();
  });
}

//
//
// export function APILogin(username: FormDataEntryValue | null, password: FormDataEntryValue | null): Promise<any> {
//   return fetch(`${baseURL}user/api/token/`, {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify({username, password})
//   }).then((response) => {
//     if (!response.ok) {
//       return response.json().then((errorData) => {
//         // Optionally, you can check errorData for more details.
//         throw new Error(errorData.detail || 'Login failed');
//       });
//     }
//     return response.json();
//   });
// }

