import axios from 'axios';

export const axiosWithSession = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

export const appLocation = `http://${window.location.hostname}:3001`;
