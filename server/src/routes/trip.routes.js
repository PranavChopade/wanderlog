import { Router } from 'express';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getAllTrips,
} from '../controllers/trip.controller.js';
import AuthToken from '../middlewares/AuthToken.middleware.js';
import upload from '../middlewares/multerUpload.middleware.js';

const router = Router();
const publicRouter = Router();

// Public Routes (no auth required)
publicRouter.get('/browse', getAllTrips);

// Protected Routes (require login)
router.use(AuthToken);

router.post('/', upload.single('coverImage'), createTrip);
router.get('/', getMyTrips);
router.get('/:id', getTripById);
router.put('/:id', upload.single('coverImage'), updateTrip);
router.delete('/:id', deleteTrip);

export { router as default, publicRouter };
