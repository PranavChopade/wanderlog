import ENV from '../config/ENV.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import jwt from 'jsonwebtoken';

const AuthToken = AsyncHandler(async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new ApiError(401, 'Unauthorized');
  }

  const decoded = jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }

  req.user = user;
  next();
});

export default AuthToken;
