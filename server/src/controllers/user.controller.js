import { User } from '../models/user.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import ENV from '../config/ENV.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
};

// Register
export const register = AsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  if (name.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters long');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const user = await User.create({ name, email, password });

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const newUser = user.toObject();
  delete newUser.password;
  res
    .status(201)
    .json(new ApiResponse(newUser, 'User registered successfully'));
});

// Login
export const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userData = user.toObject();
  delete userData.password;

  res.status(200).json(new ApiResponse(userData, 'Logged in successfully'));
});

// Logout
export const logout = AsyncHandler(async (req, res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
});

// Profile
export const profile = AsyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(req.user, 'Profile fetched successfully'));
});

// Refresh Token
export const refreshToken = AsyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    throw new ApiError(401, 'Unauthorized');
  }

  const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(new ApiResponse(null, 'Token refreshed successfully'));
});
