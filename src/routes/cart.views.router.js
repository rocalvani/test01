import { Router } from "express";
import { finalize, getCart} from "../controllers/carts.controller.js";
import { passportCall } from "../utils.js";

const router = Router();

router.get("/:cid", getCart);
router.get('/:cid/purchase', passportCall('jwt'), finalize)

export default router;
