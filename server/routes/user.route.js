import express from "express"
import { isAuth, login, logout, register, updateUser } from "../controllers/user.controller.js"
import passport from "passport"
import jwt from "jsonwebtoken"
import upload from "../middlewares/upload.js"
import authUser from "../middlewares/auth-user.js"

const router = express.Router()


router.post("/register", register)
router.post("/login", login)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.redirect(process.env.CLIENT_URL)
    }
);
router.patch(
    '/update',
    authUser,
    upload.single('image'),
    updateUser
)

router.get("/is-auth", authUser, isAuth)
router.get("/logout", authUser, logout)

export default router