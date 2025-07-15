import { Router } from "express";
import { addJob, getJob } from "../controllers/job.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/addJob').post(verifyToken, addJob)

//can protect this route, and ensure that HRs can see only their listings
router.route('/getJob').get(getJob)

export default router;

//JOB CARDS => Button (View Applied) , (Add CV)
//(ADD CV) => JOB ID goes to PARAMS, & then is fetched when CVs are Uploaded, to match and Rank the candidates