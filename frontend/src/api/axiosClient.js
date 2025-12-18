import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://homigo-bac-45.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('homigo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;

