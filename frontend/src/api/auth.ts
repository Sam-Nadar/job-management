import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const registerUser = async (email: string, password: string) => {
  return axios.post(`${API_URL}/register`, { email, password });
};

export const loginUser = async (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};
