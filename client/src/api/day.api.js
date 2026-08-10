import extractErrorMessage from '../utils/extractErrorMessage.js';
import api from './api.js';

export const getDaysByTrip = async (tripId) => {
  try {
    const response = await api.get(`/v1/trips/${tripId}/days`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to fetch days'), {
      cause: error,
    });
  }
};
export const getDayByDayNumber = async (tripId, dayNumber) => {
  try {
    const response = await api.get(`/v1/trips/${tripId}/days/${dayNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to fetch day'), {
      cause: error,
    });
  }
};

export const createDay = async (tripId, formData) => {
  try {
    const response = await api.post(`/v1/trips/${tripId}/days`, formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to create day'), {
      cause: error,
    });
  }
};

export const updateDay = async (tripId, dayId, formData) => {
  try {
    const response = await api.put(
      `/v1/trips/${tripId}/days/${dayId}`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to update day'), {
      cause: error,
    });
  }
};

export const deleteDay = async (tripId, dayId) => {
  try {
    const response = await api.delete(`/v1/trips/${tripId}/days/${dayId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to delete day'), {
      cause: error,
    });
  }
};

export const generateDays = async (tripId) => {
  try {
    const response = await api.post(`/v1/trips/${tripId}/days/generate`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to generate days'), {
      cause: error,
    });
  }
};

export const removePhoto = async (tripId, dayId, photoUrl) => {
  try {
    const response = await api.patch(
      `/v1/trips/${tripId}/days/${dayId}/photos`,
      {
        photoUrl,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'failed to remove photo'), {
      cause: error,
    });
  }
};
