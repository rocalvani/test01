import { Router } from "express";
import { logIn, signUp } from "../controllers/sessions.controller.js";
import errorHandler from '../errors/index.js'
import { upload } from "../utils.js";

const router = Router();

router.post("/login", logIn);
router.post("/signup",upload.single('pfp'), signUp);

router.use(errorHandler)

export default router;
