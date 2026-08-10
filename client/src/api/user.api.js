import extractErrorMessage from '../utils/extractErrorMessage.js';
import api from './api.js';

export const register = async ({ name, email, password }) => {
  try {
    const response = await api.post('/v1/users/register', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to register user'), {
      cause: error,
    });
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post('/v1/users/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to login user'), {
      cause: error,
    });
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/v1/users/logout');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to logout user'), {
      cause: error,
    });
  }
};

export const profile = async () => {
  try {
    const response = await api.get('/v1/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'failed to fetch user profile'),
      { cause: error },
    );
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/v1/users/refresh-token');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to refresh token'), {
      cause: error,
    });
  }
};
