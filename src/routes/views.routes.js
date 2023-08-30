import express from "express";
import { authorization, passportCall } from "../utils.js";
import { renderChat, sendMSG } from "../controllers/chat.controller.js";
import {sendSMS} from '../controllers/sms.controller.js';
import { getFaker } from "../controllers/faker.controller.js";
import { sub } from "../controllers/subscription.controller.js";

const router = express.Router();

// CHAT

router.get("/chat", passportCall('jwt'), authorization('user'), renderChat);
router.post("/chat", sendMSG);

// SMS 
router.get("/", sendSMS);

// FAKER
router.get('/mockingproducts', getFaker)

// SUBSCRIBE
router.post('/subscribe', sub)


export default router;
