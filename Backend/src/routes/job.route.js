import { Router } from "express";
import { addJob, getHrJobs, getJob, getApplicants } from "../controllers/job.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/addJob').post(verifyToken, addJob)

router.route('/getJob').get(getJob)

//job details by Hr's id.
router.route('/getHrJobs').get(verifyToken, getHrJobs)

router.route('/:id/applicants').get(verifyToken, getApplicants)

export default router;

//JOB CARDS => Button (View Applied) , (Add CV)
//(ADD CV) => JOB ID goes to PARAMS, & then is fetched when CVs are Uploaded, to match and Rank the candidates