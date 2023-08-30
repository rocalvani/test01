import { Router } from "express";
import { passportCall } from "../utils.js";
import { userServices } from "../dao/repository/index.js";
import { deleteWish, getWish, wish } from "../controllers/user.controller.js";


const router = Router()

router.get("/", passportCall('jwt'), getWish)
router.post("/:pid", passportCall('jwt'), wish)
router.delete("/:pid", passportCall('jwt'), deleteWish )


export default router