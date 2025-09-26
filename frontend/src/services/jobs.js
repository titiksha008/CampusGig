import api from './api'; // adjust if your api.js file is named differently or located elsewhere

export const getJobs = (search = '', role = '') => {
  return api.get('/jobs', { params: { search, role } });
};

export const acceptJob = (id) => {
  return api.put(`/jobs/${id}/accept`);
};

export const getAcceptedJobs = () => {
  return api.get('/jobs/accepted');
<<<<<<< HEAD
};
=======
};
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
