import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { auth } from '../middleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router;