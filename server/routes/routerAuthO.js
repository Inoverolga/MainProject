import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const routerAuthO = express.Router();

const createAuthResponse = (req, res) => {
  const token = jwt.sign(
    { userId: req.user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
};

// Google OAuth
routerAuthO.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routerAuthO.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  createAuthResponse
);

// Facebook OAuth
routerAuthO.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

routerAuthO.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  createAuthResponse
);
export default routerAuthO;
