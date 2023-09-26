import { Router, Response } from "express";
import { loginUser, registerUser } from "./controller";
// import { auth } from "../../middleware/auth";

const router:Router = Router();

router.route('/login')
    .post(loginUser);

router.route('/register')
    .post(registerUser);

export default router;