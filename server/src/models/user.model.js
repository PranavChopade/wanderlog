import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ENV from '../config/ENV.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign({ id: this._id }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ id: this._id }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const User = mongoose.model('User', userSchema);
