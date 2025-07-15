import { Router } from "express";
import { addJob, getJob } from "../controllers/job.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/addJob').post(verifyToken, addJob)
router.route('/getJob').get(getJob)

export default router;