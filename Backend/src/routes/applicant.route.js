import { Router } from "express";
import { getApplicantData, updateStatus, uploadResume } from "../controllers/applicant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/uploadResume').post(
    upload.fields([{
        name:"Resume",
        maxCount:10
    }]), uploadResume)

router.route('/:id').get(getApplicantData);

//update status of applicant
router.route('/:id/updateStatus').put(updateStatus);

// //update test score
// router.route('/:id/updateTest').get(getApplicantData);

// //update interview score
// router.route('/:id/updateInterview').get(getApplicantData);

export default router;