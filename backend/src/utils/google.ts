import querystring from "querystring";
import axios from "axios";
import config from "../config";

const { serverURI, googleClientID } = config;

export function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${serverURI}/auth/google`,
        client_id: googleClientID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}

export function getTokens({
    code,
    clientId,
    clientSecret,
    redirectUri,
}: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<{
    access_token: string;
    expires_in: Number;
    refresh_token: string;
    scope: string;
    id_token: string;
}> {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };

    return axios
        .post(url, querystring.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch auth tokens`);
            throw new Error(error.message);
        });
}


