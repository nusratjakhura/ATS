import { Router } from "express";
import { loginHR, logoutHR, registerHR, getProfile, changePassword } from "../controllers/hr.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerHR)
router.route('/login').post(loginHR)

//protected routes
router.route('/logout').post(verifyToken, logoutHR)
router.route('/profile').get(verifyToken, getProfile)
router.route('/change-password').put(verifyToken, changePassword)

export default router;