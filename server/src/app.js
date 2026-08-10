import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import GlobalErrorHandler from './middlewares/globalErrorHandler.Middleware.js';
import UserRoutes from './routes/user.routes.js';
import TripRoutes, {
  publicRouter as TripPublicRoutes,
} from './routes/trip.routes.js';
import DayRoutes from './routes/day.routes.js';
import DashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());

app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/trips', TripPublicRoutes); // Public
app.use('/api/v1/trips', TripRoutes); // Protected
app.use('/api/v1/trips/:tripId/days', DayRoutes);
app.use('/api/v1/dashboard', DashboardRoutes);

app.use(GlobalErrorHandler);

export default app;
