import { Router } from "express";
import { getGoogleAuthURL, getGoogleUser } from "../../utils/google";
import UserRepo from "../../db/repository/Users";
import { setCookie } from "../../utils";
import config from "../../config";

const {
    clientURI,
    redirectURI
} = config;

const router: Router = Router();

router.get("/auth/google/url", (req, res) => {
    const url = getGoogleAuthURL();
    return res.send({ url });
});

router.get(`/${redirectURI}`, async (req, res, next) => {
    const { code, state } = req.query;

    if (typeof code !== "string") {
        throw new Error("Invalid code");
    }

    if (!(typeof state === "string" || typeof state === "undefined")) {
        throw new Error("Invalid state");
    }

    try {
        const { name, email } = await getGoogleUser(code);

        if (!name || !email || typeof name !== "string" || typeof email !== "string") {
            throw new Error("Invalid user data");
        }

        let user = await UserRepo.findByUserEmail(email);

        if (!user) {
            user = await UserRepo.createNewUser({
                name: name,
                email: email,
                isAdmin: false,
                isGoogleUser: true,
            });
        } else {
            user = await UserRepo.setField(user, "isGoogleUser", true);
        }

        setCookie(user, res);

        res.redirect(`${clientURI}/${state || ""}`);
    } catch (error) {
        next(error);
    }
});

export default router;