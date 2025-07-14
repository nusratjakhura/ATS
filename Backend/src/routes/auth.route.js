import { Router } from "express";
import { meRoute } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

//protected Routes
router.route('/me').get(verifyToken, meRoute)

export default router