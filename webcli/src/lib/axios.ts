import axios from 'axios';
import { APP_LOCATION } from '../const';

export const axiosWithSession = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  baseURL: APP_LOCATION,
});
