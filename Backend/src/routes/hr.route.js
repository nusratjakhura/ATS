import { Router } from "express";
import { registerHR } from "../controllers/hr.controller.js";

const router = Router();

router.route('/register').post(registerHR)

export default router;