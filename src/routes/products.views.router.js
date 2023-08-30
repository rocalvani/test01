import { Router } from "express";
import {
  getOwner,
  getProduct,
  getProducts,
  getProductsByTag,
  paginateProducts,
} from "../controllers/products.controller.js";
import { deny, passportCall } from ".././utils.js";

const router = Router();

router.get("/", passportCall("jwt"), paginateProducts);
router.get("/tag/:tag", getProductsByTag)
router.get("/react", getProducts);
router.get("/:pid", getProduct);
router.get("/settings/admin", passportCall("jwt"), deny("user"), getOwner)

export default router;
