import { expressjwt as jwt } from "express-jwt";

function authJwt() {
    const secret = process.env.JSON_WEB_TOKEN_SECRET_KEY;
    return jwt({
        secret: secret,
        algorithms: ["HS256"]
    }).unless({
        custom: (req) => 
            req.method === "GET" ||
            /\/api\/user(\/.*)?$/.test(req.path), 
    });
}

export default authJwt;
