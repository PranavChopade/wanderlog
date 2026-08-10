import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxLength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxLength: 2000,
    },
    photos: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// A day belongs to a trip, and day numbers should be unique within that trip
daySchema.index({ trip: 1, dayNumber: 1 }, { unique: true });

export const Day = mongoose.model('Day', daySchema);
