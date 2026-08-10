import mongoose from 'mongoose';
import ENV from './ENV.js';

mongoose.connection.on('connected', () => {
  console.log('database connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('database disconnected');
});

mongoose.connection.on('error', (error) => {
  console.log('database connection error:', error);
});

const connectDB = async () => {
  await mongoose.connect(ENV.MONGO_URI, { dbName: ENV.DB_NAME });
};

export default connectDB;
