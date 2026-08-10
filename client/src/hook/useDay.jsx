import { useCallback, useState } from 'react';
import {
  createDay as createDayApi,
  deleteDay as deleteDayApi,
  generateDays,
  getDaysByTrip,
  removePhoto,
  updateDay as updateDayApi,
  getDayByDayNumber
} from '../api/day.api.js';

const useDay = () => {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayData, setDayData] = useState(null);

  const fetchDaysByTrip = useCallback(async (tripId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDaysByTrip(tripId);
      setDays(data?.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDay = useCallback(async (tripId, dayNumber) => {
    const data = await getDayByDayNumber(tripId, Number(dayNumber))
    setDayData(data?.data)
    return data?.data
  }, [])

  const createDay = useCallback(async (tripId, dayData) => {
    const data = await createDayApi(tripId, dayData);
    return data?.data;
  }, []);

  const updateDay = useCallback(async (tripId, dayId, dayData) => {
    const data = await updateDayApi(tripId, dayId, dayData);
    return data?.data;
  }, []);

  const deleteDay = useCallback(async (tripId, dayId) => {
    const data = await deleteDayApi(tripId, dayId);
    return data?.data;
  }, []);

  const generateDaysForTrip = useCallback(async (tripId) => {
    const data = await generateDays(tripId);
    return data?.data;
  }, []);

  const removePhotoFromDay = useCallback(async (tripId, dayId, photoUrl) => {
    const data = await removePhoto(tripId, dayId, photoUrl);
    return data?.data;
  }, []);

  return {
    days,
    loading,
    error,
    fetchDaysByTrip,
    getDay,
    createDay,
    updateDay,
    deleteDay,
    generateDaysForTrip,
    removePhotoFromDay,
  };
};

export default useDay;