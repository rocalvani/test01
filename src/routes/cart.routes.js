import { Router } from "express";
import { authorization, deny, passportCall } from "../utils.js";
import { cartServices } from "../dao/repository/index.js";
import { productService } from "../dao/managers/factory.js";
import { addMoreOf, addProductToCart, autofill, deleteProductFromCart, emptyCart } from "../controllers/carts.controller.js";

const router = Router();



router.post("/:cid/product/:pid", passportCall('jwt'), deny('admin'), addProductToCart);
router.put ("/:cid/product/:pid", addMoreOf)
router.delete("/:cid/product/:pid", deleteProductFromCart);
router.delete("/:cid", emptyCart)



// UNUSED ENDPOINTS //
router.post("/", async (req, res) => {
  try {
    let result = await cartServices.save(req.body);
    res.status(201).send(result);
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
    res
      .status(500)
      .send({ error: error, message: "couldn't create this cart" });
  }
});
router.put("/:cid", autofill)
export default router;
