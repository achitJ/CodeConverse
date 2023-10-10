import { Router, Response } from "express";
import { getUserDetails, loginUser, logoutUser, registerUser } from "./controller";
import { auth } from "../../middlewares/auth"

const router:Router = Router();

router.route('/login')
    .post(loginUser);

router.route('/register')
    .post(registerUser);

router.use(auth);

router.route('/logout')
    .delete(logoutUser)
    

router.route('/me')
    .get(getUserDetails);

export default router;