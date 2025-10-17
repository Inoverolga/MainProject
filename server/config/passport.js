import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../lib/prisma.js";

export const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://mainproject-back.onrender.com"
    : "http://localhost:3001";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${baseURL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase().trim();

        const checkUser = await prisma.user.findUnique({
          where: { email: email },
        });
        if (checkUser) {
          return done(
            new Error("Пользователь с таким email уже существует"),
            null
          );
        }

        const user = await prisma.user.create({
          data: {
            email: email,
            name: profile.displayName,
            password: "oauth-google-user",
          },
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${baseURL}/api/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = (
          profile.emails?.[0]?.value || `${profile.id}@facebook.com`
        )
          .toLowerCase()
          .trim();

        const checkUser = await prisma.user.findUnique({
          where: { email: email },
        });
        if (checkUser) {
          return done(
            new Error("Пользователь с таким email уже существует"),
            null
          );
        }
        const user = await prisma.user.create({
          data: {
            email: email,
            name: profile.displayName,
            password: "oauth-facebook-user",
          },
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
