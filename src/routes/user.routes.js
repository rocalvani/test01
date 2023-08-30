import { Router } from "express";
import { userModel } from "../dao/managers/db/models/users.js";
import {
  authToken,
  validPass,
  upload,
  passportCall,
  authorization,
  expirationCall,
} from ".././utils.js";
import {
  deleteInactive,
  editPassword,
  editUser,
  getUserDTO,
  premiumUpgrade,
  resetPass,
  tokenMailing,
  uploadFiles,
} from "../controllers/user.controller.js";

const router = Router();

// USED ENDPOINTS  
router.get("/", getUserDTO);
router.post("/reset", tokenMailing);
router.post("/reset/:tk", expirationCall("expiration"), resetPass);
router.post("/:uid/edit", passportCall("jwt"), upload.single("pfp"), editUser);
router.post("/user/documents/:uid", passportCall("jwt"), upload.array("documents"), uploadFiles);
router.put("/:uid/password",passportCall("jwt"), editPassword);
router.put("/premium/:uid", passportCall("jwt"), authorization("admin"), premiumUpgrade);
router.delete("/", passportCall("jwt"), authorization("admin"), deleteInactive);

// UNUSED ENDPOINTS 
// router.post("/", authToken, async (req, res) => {
//   try {
//     let { firstName, lastName, email } = req.body;
//     let user = await userModel.create({ firstName, lastName, email });
//     res.status(201).send(user);
//   } catch (error) {
//     res.send("error");
//   }
// });

// router.put("/:id", editPassword)


export default router;
