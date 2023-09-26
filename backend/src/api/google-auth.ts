import { Router } from "express";
import axios from "axios";
import { getGoogleAuthURL, getTokens } from "../utils/google";
import config from "../config";

const {
    serverURI,
    googleClientID, 
    googleClientSecret,
} = config;
const router:Router = Router();
const redirectURI = "auth/google";

router.get("/auth/google/url", (req, res) => {
    console.log(req.query.state);

    const state = req.query.state;

    if(typeof state === "string" || typeof state === "undefined") {
        const url = getGoogleAuthURL(state);
        return res.send({ url });
    }
    
    return res.send("Invalid state");
});

router.get(`/${redirectURI}`, async (req, res) => {
    const { code, state } = req.query;

    if (typeof code !== "string" || typeof state !== "string") {
        throw new Error("Invalid code");
    }
  
    const { id_token, access_token } = await getTokens({
      code,
      clientId: googleClientID,
      clientSecret: googleClientSecret,
      redirectUri: `${serverURI}/${redirectURI}`,
    });
  
    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        console.error(`Failed to fetch user`);
        throw new Error(error.message);
      });

    res.send(googleUser);
});

export default router;