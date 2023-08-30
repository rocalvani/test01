import { Router } from "express";
import { authorization, deny, passportCall, upload } from "../utils.js";
import { createProduct, deleteProduct, updateProduct} from "../controllers/products.controller.js";
import { productServices } from "../dao/repository/index.js";

const router = Router();



router.post("/",passportCall('jwt'), deny('user'), upload.array('thumbnail', 3), createProduct);
router.put("/:pid",passportCall('jwt'), deny('user'), upload.array('thumbnail', 3), updateProduct)
router.delete("/:pid", passportCall('jwt'), deny('user'),deleteProduct );

router.get("/", (req, res) => {
    res.render("realTimeProducts")
})

const Regex = "([a-zA-Z%C3%A1%C3%A9%20]+)"
router.get(`/:word${Regex}`, async (req, res) => {
    try {
        const pets = req.product;
        if (!pets) {
            res.status(202).json({ msj: "No pets found" })
        }
        res.json(pets)
    } catch (error) {
        req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
        res.status(500).send({ error: "Error consultando las mascotas", message: error });
    }
});

router.get("*", (req, res) => {
  res.status(404).send("Cannot get that URL!!")
});


//MIDDLEWARE
router.param("word", async (req, res, next, name) => {
  try {
      let result = await productServices.findBy({title: name})
      if (!result) {
          req.product = null;
      } else {
          req.product = result;
      }
      next();
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
      res.status(500).send({ error: "Error consultando las mascotas", message: error });
  }
});

export default router;
