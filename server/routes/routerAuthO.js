import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const routerAuthO = express.Router();

const createAuthResponse = (req, res) => {
  const { authError, user } = req;

  const messageData = authError
    ? { type: "OAUTH_ERROR", error: authError.message }
    : {
        type: "OAUTH_SUCCESS",
        token: jwt.sign(
          { userId: user.id, isAdmin: user.isAdmin },
          process.env.JWT_ACCESS_SECRET,
          {
            expiresIn: "7d",
          }
        ),
        user: user,
        isAdmin: user.isAdmin,
      };

  res.send(`
    <html>
      <script>
        window.opener.postMessage(${JSON.stringify(messageData)}, '*');
        window.close();
      </script>
    </html>
  `);
};

routerAuthO.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

routerAuthO.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (error, user) => {
      req.authError = error || null;
      req.user = user || null;
      next();
    })(req, res, next);
  },
  createAuthResponse
);

routerAuthO.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

routerAuthO.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, (error, user) => {
      req.authError = error || null;
      req.user = user || null;
      next();
    })(req, res, next);
  },
  createAuthResponse
);

export default routerAuthO;
