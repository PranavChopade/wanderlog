import { useCallback, useState } from 'react';
import {
  createTrip as createTripApi,
  deleteTrip as deleteTripApi,
  getAllTrips,
  getMyTrips,
  getTripById,
  updateTrip as updateTripApi,
} from '../api/trip.api.js';

const useTrip = () => {
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalCount: 0, totalPages: 1 });

  const fetchMyTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyTrips();
      setTrips(data?.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTrips = useCallback(async (page = 1, limit = 9) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTrips(page, limit);
      setTrips(data?.data?.trips || []);
      setPagination({
        page: data?.data?.page || page,
        limit: data?.data?.limit || limit,
        totalCount: data?.data?.totalCount || 0,
        totalPages: data?.data?.totalPages || 1,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTripById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTripById(id);
      setTrip(data?.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData) => {
    const data = await createTripApi(tripData);
    return data?.data;
  }, []);

  const updateTrip = useCallback(async (id, tripData) => {
    const data = await updateTripApi(id, tripData);
    return data?.data;
  }, []);

  const deleteTrip = useCallback(async (id) => {
    const data = await deleteTripApi(id);
    return data?.data;
  }, []);

  return {
    trips,
    trip,
    loading,
    error,
    pagination,
    fetchMyTrips,
    fetchAllTrips,
    fetchTripById,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};

export default useTrip;