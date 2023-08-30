import { Router } from "express";
import { passportCall } from "../utils.js";
import { deleteComment, newComment } from "../controllers/comments.controller.js";
const router = Router()

router.post("/:pid", passportCall('jwt'), newComment)
router.delete("/:pid/:id", passportCall('jwt'), deleteComment)

export default router