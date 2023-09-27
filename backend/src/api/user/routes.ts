import { Router, Response } from "express";
import { loginUser, registerUser } from "./controller";
import { auth } from "../../middlewares/auth"

const router:Router = Router();

router.route('/login')
    .post(loginUser);

router.route('/register')
    .post(registerUser);

router.use(auth);

router.route('/me')
    .get((req:RequestWithUser, res:Response) => {
        res.status(200).json({user: req.user});
    });

export default router;