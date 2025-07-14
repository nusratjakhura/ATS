import { Router } from "express";
import { uploadResume } from "../controllers/applicant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/uploadResume').post(
    upload.fields([{
        name:"Resume",
        maxCount:10
    }]), uploadResume)

export default router;