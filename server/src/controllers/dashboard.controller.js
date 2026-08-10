import { Trip } from '../models/trip.model.js';
import { Day } from '../models/day.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get Dashboard Stats ──────────────────────────────────
export const getDashboardStats = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all trips for this user
  const trips = await Trip.find({ user: userId });

  // Total trips count
  const totalTrips = trips.length;

  // Unique destinations (case-insensitive)
  const destinations = [
    ...new Set(trips.map((t) => t.destination.toLowerCase())),
  ];
  const uniqueDestinations = destinations.length;

  // Total trip duration in days
  const totalDuration = trips.reduce((sum, trip) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return sum + days;
  }, 0);

  // Get all day IDs for this user's trips
  const tripIds = trips.map((t) => t._id);

  // Total days count
  const totalDays = await Day.countDocuments({ trip: { $in: tripIds } });

  // Total photos count (sum of all photos arrays across all days)
  const allDays = await Day.find({ trip: { $in: tripIds } }).select('photos');
  const totalPhotos = allDays.reduce((sum, day) => sum + day.photos.length, 0);

  res.status(200).json(
    new ApiResponse(
      {
        totalTrips,
        uniqueDestinations,
        totalDuration,
        totalDays,
        totalPhotos,
      },
      'Dashboard stats fetched successfully',
    ),
  );
});
