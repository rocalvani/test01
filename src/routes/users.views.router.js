import { Router } from "express";
import { passportCall, authorization, expirationCall } from ".././utils.js";
import { current, logOut } from "../controllers/sessions.controller.js";
import { getDTO, resetPass, tokenMailing } from "../controllers/user.controller.js";

const router = Router();

// USED ENDPOINTS //
router.get("/user/:uid", passportCall("jwt"), getDTO);
router.get("/online", passportCall("jwt"), async (req, res) => {
    res.send({ user: req.user });});
router.get("/", passportCall("jwt"), current);
router.get("/logout", passportCall("jwt"), logOut);

// UNUSED ENDPOINTS //
router.get("/login", (req, res) => {res.render("login");});
router.get("/signup", (req, res) => {res.render("signup");});
router.get("/reset", (req, res) => {res.render("recover");});
router.get("/reset/:tk", expirationCall("expiration"), (req, res) => {res.render("reset");});

export default router;
