import extractErrorMessage from '../utils/extractErrorMessage.js';
import api from './api.js';

export const createTrip = async ({
  title,
  destination,
  startDate,
  endDate,
  description,
  isPublic,
  tags,
  coverImage,
}) => {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('destination', destination);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    if (description) formData.append('description', description);
    formData.append('isPublic', isPublic);
    tags?.forEach((tag) => formData.append('tags', tag));
    if (coverImage) formData.append('coverImage', coverImage);

    const response = await api.post('/v1/trips', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to create trip'), {
      cause: error,
    });
  }
};

export const getAllTrips = async (page = 1, limit = 9) => {
  try {
    const response = await api.get('/v1/trips/browse', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'failed to fetch all free trips'),
      { cause: error },
    );
  }
};

export const getMyTrips = async () => {
  try {
    const response = await api.get('/v1/trips');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to fetch user trips'), {
      cause: error,
    });
  }
};

export const getTripById = async (id) => {
  try {
    const response = await api.get(`/v1/trips/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to fetch trip'), {
      cause: error,
    });
  }
};

export const updateTrip = async (
  id,
  {
    title,
    destination,
    startDate,
    endDate,
    description,
    isPublic,
    tags,
    coverImage,
  },
) => {
  try {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (destination) formData.append('destination', destination);
    if (startDate) formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);
    if (description !== undefined) formData.append('description', description);
    if (isPublic !== undefined) formData.append('isPublic', isPublic);
    tags?.forEach((tag) => formData.append('tags', tag));
    if (coverImage) formData.append('coverImage', coverImage);

    const response = await api.put(`/v1/trips/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to update trip'), {
      cause: error,
    });
  }
};

export const deleteTrip = async (id) => {
  try {
    const response = await api.delete(`/v1/trips/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to delete trip'), {
      cause: error,
    });
  }
};
