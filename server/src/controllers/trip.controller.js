import { Trip } from '../models/trip.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';
import { Day } from '../models/day.model.js';

// Create Trip
export const createTrip = AsyncHandler(async (req, res) => {
  const {
    title,
    destination,
    startDate,
    endDate,
    description,
    isPublic,
    tags,
  } = req.body;

  if (!title || !destination || !startDate || !endDate) {
    throw new ApiError(
      400,
      'Title, destination, start date and end date are required',
    );
  }

  let coverImage = '';

  if (req.file) {
    coverImage = await uploadToCloudinary(req.file.buffer, 'wanderlog/trips');
  }

  const trip = await Trip.create({
    user: req.user._id,
    title,
    destination,
    startDate,
    endDate,
    coverImage,
    description,
    isPublic: isPublic === 'true' || isPublic === true,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
  });

  res.status(201).json(new ApiResponse(trip, 'Trip created successfully'));
});

// Get All Trips (logged-in user's trips)
export const getMyTrips = AsyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ startDate: -1 });

  res.status(200).json(new ApiResponse(trips, 'Trips fetched successfully'));
});

// Get Trip by ID
export const getTripById = AsyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { isPublic: true }],
  });

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  res.status(200).json(new ApiResponse(trip, 'Trip fetched successfully'));
});

// Update Trip
export const updateTrip = AsyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const {
    title,
    destination,
    startDate,
    endDate,
    description,
    isPublic,
    tags,
  } = req.body;

  if (title) trip.title = title;
  if (destination) trip.destination = destination;
  if (startDate) trip.startDate = startDate;
  if (endDate) trip.endDate = endDate;
  if (description !== undefined) trip.description = description;
  if (isPublic !== undefined)
    trip.isPublic = isPublic === 'true' || isPublic === true;
  if (tags) trip.tags = Array.isArray(tags) ? tags : [tags];

  if (req.file) {
    trip.coverImage = await uploadToCloudinary(
      req.file.buffer,
      'wanderlog/trips',
    );
  }

  await trip.save();

  res.status(200).json(new ApiResponse(trip, 'Trip updated successfully'));
});

// Delete Trip
export const deleteTrip = AsyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  await Day.deleteMany({ trip: req.params.id });

  await Trip.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(null, 'Trip deleted successfully'));
});

// get all trips with filter and pagination
export const getAllTrips = AsyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const { destination } = req.query;
  const { tags } = req.query;
  const { startDate } = req.query;
  const { endDate } = req.query;

  let filter = {
    isPublic: true,
  };

  if (destination) filter.destination = { $regex: destination, $options: 'i' };

  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

  if (startDate) filter.startDate = { $gte: new Date(startDate) };

  if (endDate) filter.endDate = { $lte: new Date(endDate) };

  const trips = await Trip.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ startDate: -1 });

  const totalCount = await Trip.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      {
        trips,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      'trips fetched successfully',
    ),
  );
});
