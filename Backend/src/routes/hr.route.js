import { Router } from "express";
import { loginHR, logoutHR, registerHR } from "../controllers/hr.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerHR)
router.route('/login').post(loginHR)

//protected route
router.route('/logout').post(verifyToken,logoutHR)

export default router;