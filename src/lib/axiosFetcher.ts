import axios from 'axios';

import { API_URL, FETCHER_TIMEOUT } from '@/config';
import { getUser, setUser } from '@/lib/userStore';

const RedirectingMsg = 'No token, redirecting.';

const axiosFetcher = axios.create({
  baseURL: API_URL,
  timeout: FETCHER_TIMEOUT,
});

axiosFetcher.interceptors.request.use((config) => {
  const token = getUser()?.token;
  if (!token) {
    window.location.replace('/');
    return Promise.reject(new axios.Cancel(RedirectingMsg));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosFetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.status === 498
    ) {
      setUser(null);
      window.location.replace('/');
      return Promise.reject(new axios.Cancel(RedirectingMsg));
    }
    return Promise.reject(error);
  },
);

export { axiosFetcher, RedirectingMsg };
