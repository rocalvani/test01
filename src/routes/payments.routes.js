import { Router } from "express";
import { paymentIntent } from "../controllers/payments.controller.js";

const router = Router();

router.post("/payment-intents", paymentIntent);

export default router;
