import { Router } from "express";
import { getApplicantData, updateStatus, uploadResume, addTestScore, updateInterview1, updateInterview2, onboardCandidate, sendTestLink, sendInterviewLink, sendOnboardingEmail} from "../controllers/applicant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/uploadResume').post(
    upload.fields([{
        name:"Resume",
        maxCount:10
    }]), uploadResume)

router.route('/:id').get(getApplicantData);

//update status of applicant
router.route('/:id/updateStatus').put(verifyToken, updateStatus);

//update test score
router.route('/:id/updateTest').post(verifyToken, upload.fields([{
        name:"TestScores",
        maxCount:1
    }]),addTestScore);

//update interview score
router.route('/:id/updateInterview1').put(verifyToken, updateInterview1);
router.route('/:id/updateInterview2').put(verifyToken, updateInterview2);

//onboard candidate
router.route('/:id/onboard').put(verifyToken, onboardCandidate);

// Email sending routes
router.route('/sendTestLink').post(verifyToken, sendTestLink);
router.route('/sendInterviewLink').post(verifyToken, sendInterviewLink);
router.route('/sendOnboardingEmail').post(verifyToken, sendOnboardingEmail);

export default router;