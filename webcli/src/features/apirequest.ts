import axios from "axios";

const instance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  }
});

export default instance;
