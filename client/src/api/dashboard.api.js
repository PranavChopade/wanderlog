import extractErrorMessage from '../utils/extractErrorMessage.js';
import api from './api.js';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/v1/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'failed to fetch dashboard stats'),
      { cause: error },
    );
  }
};
