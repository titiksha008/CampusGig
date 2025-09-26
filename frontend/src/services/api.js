import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

export default api;
=======
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL:"http://localhost:5000/api",
  withCredentials: true,
});

export default api;
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
