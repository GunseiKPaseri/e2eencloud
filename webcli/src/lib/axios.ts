import axios from 'axios';
import { APP_LOCATION } from '~/const/const';

export const axiosWithSession = axios.create({
  baseURL: APP_LOCATION,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: true,
});
