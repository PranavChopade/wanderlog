import { Router } from 'express';
import {
  createDay,
  getDaysByTrip,
  getDayByDayNumber,
  updateDay,
  deleteDay,
  generateDays,
  removePhoto,
} from '../controllers/day.controller.js';
import AuthToken from '../middlewares/AuthToken.middleware.js';
import upload from '../middlewares/multerUpload.middleware.js';

const router = Router({ mergeParams: true });

router.use(AuthToken);

router.post('/', upload.array('photos', 10), createDay);
router.post('/generate', generateDays);
router.get('/', getDaysByTrip);
router.get('/:dayNumber', getDayByDayNumber);
router.put('/:dayId', upload.array('photos', 10), updateDay);
router.delete('/:dayId', deleteDay);
router.patch('/:dayId/photos', removePhoto);

export default router;
