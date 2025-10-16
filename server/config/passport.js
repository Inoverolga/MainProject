import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../lib/prisma.js";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://mainproject-back.onrender.com"
    : "http://localhost:3001";

console.log("=== DEBUG OAuth URLs ===");
console.log("Google Callback URL:", `${baseURL}/auth/google/callback`);
console.log("Full Google OAuth URL will use this callback");

// Настройка Google стратегии
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${baseURL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ищем или создаем пользователя в вашей БД
        const user = await prisma.user.upsert({
          where: { email: profile.emails[0].value },
          create: {
            email: profile.emails[0].value,
            name: profile.displayName,
            password: "oauth-user",
          },
          update: {
            name: profile.displayName,
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
        const email =
          profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
        const user = await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: profile.displayName,
            password: "oauth-user",
          },
          update: {
            name: profile.displayName,
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
