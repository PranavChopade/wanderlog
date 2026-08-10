import { Day } from '../models/day.model.js';
import { Trip } from '../models/trip.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';

// Create Day
export const createDay = AsyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { dayNumber, date, title, description, location } = req.body;

  // Verify the trip exists and belongs to current user
  const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (!dayNumber || !date) {
    throw new ApiError(400, 'Day number and date are required');
  }

  // Check for duplicate day number within the same trip
  const existingDay = await Day.findOne({ trip: tripId, dayNumber });
  if (existingDay) {
    throw new ApiError(409, `Day ${dayNumber} already exists for this trip`);
  }

  // Upload photos if provided
  const photos = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'wanderlog/days');
      photos.push(url);
    }
  }

  const day = await Day.create({
    trip: tripId,
    dayNumber,
    date,
    title,
    description,
    photos,
    location,
  });

  res.status(201).json(new ApiResponse(day, 'Day created successfully'));
});

// Get All Days for a Trip
export const getDaysByTrip = AsyncHandler(async (req, res) => {
  const { tripId } = req.params;

  // Verify trip exists and user has access
  const trip = await Trip.findOne({
    _id: tripId,
    $or: [{ user: req.user._id }, { isPublic: true }],
  });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const days = await Day.find({ trip: tripId }).sort({ dayNumber: 1 });

  res.status(200).json(new ApiResponse(days, 'Days fetched successfully'));
});

// Get Single Day
export const getDayByDayNumber = AsyncHandler(async (req, res) => {
  const { tripId, dayNumber } = req.params;

  const day = await Day.findOne({ trip: tripId, dayNumber: dayNumber });
  if (!day) {
    throw new ApiError(404, 'Day not found');
  }

  // Verify trip access
  const trip = await Trip.findOne({
    _id: tripId,
    $or: [{ user: req.user._id }, { isPublic: true }],
  });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  res.status(200).json(new ApiResponse(day, 'Day fetched successfully'));
});

// Update Day
export const updateDay = AsyncHandler(async (req, res) => {
  const { tripId, dayId } = req.params;

  // Verify trip ownership
  const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const day = await Day.findOne({ _id: dayId, trip: tripId });
  if (!day) {
    throw new ApiError(404, 'Day not found');
  }

  const { dayNumber, date, title, description, location } = req.body;
  if (dayNumber !== undefined) {
    // If changing day number, check no conflict
    if (Number(dayNumber) !== day.dayNumber) {
      const conflict = await Day.findOne({ trip: tripId, dayNumber });
      if (conflict) {
        throw new ApiError(
          409,
          `Day ${dayNumber} already exists for this trip`,
        );
      }
    }
    day.dayNumber = dayNumber;
  }
  if (date) day.date = date;
  if (title !== undefined) day.title = title;
  if (description !== undefined) day.description = description;
  if (location !== undefined) day.location = location;

  // Upload new photos if provided (appends to existing)
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'wanderlog/days');
      day.photos.push(url);
    }
  }

  await day.save();

  res.status(200).json(new ApiResponse(day, 'Day updated successfully'));
});

// Delete Day
export const deleteDay = AsyncHandler(async (req, res) => {
  const { tripId, dayId } = req.params;

  // Verify trip ownership
  const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const day = await Day.findOneAndDelete({ _id: dayId, trip: tripId });
  if (!day) {
    throw new ApiError(404, 'Day not found');
  }

  res.status(200).json(new ApiResponse(null, 'Day deleted successfully'));
});

// Bulk Generate Days from Trip Date Range
export const generateDays = AsyncHandler(async (req, res) => {
  const { tripId } = req.params;

  // Verify trip ownership
  const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  // Calculate the number of days between start and end date
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) {
    throw new ApiError(400, 'End date must be after start date');
  }

  // Check which days already exist (don't create duplicates)
  const existingDays = await Day.find({ trip: tripId }).select('dayNumber');
  const existingNumbers = existingDays.map((d) => d.dayNumber);

  const createdDays = [];

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;

    // Skip if this day number already exists
    if (existingNumbers.includes(dayNumber)) {
      continue;
    }

    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    const day = await Day.create({
      trip: tripId,
      dayNumber,
      date: currentDate,
      title: `Day ${dayNumber}`,
    });

    createdDays.push(day);
  }

  res.status(201).json(
    new ApiResponse(
      {
        created: createdDays,
        skipped: totalDays - createdDays.length,
        total: totalDays,
      },
      `${createdDays.length} days generated successfully`,
    ),
  );
});

// Remove a Photo from Day
export const removePhoto = AsyncHandler(async (req, res) => {
  const { tripId, dayId } = req.params;
  const { photoUrl } = req.body;

  if (!photoUrl) {
    throw new ApiError(400, 'Photo URL is required');
  }

  // Verify trip ownership
  const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const day = await Day.findOne({ _id: dayId, trip: tripId });
  if (!day) {
    throw new ApiError(404, 'Day not found');
  }

  day.photos = day.photos.filter((url) => url !== photoUrl);
  await day.save();

  res.status(200).json(new ApiResponse(day, 'Photo removed successfully'));
});
