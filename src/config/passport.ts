import passport from "passport";
import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
} from "passport-google-oauth20";
import prisma from "../config/prisma";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { User } from "@prisma/client";

dotenv.config();

if (
  !process.env.JWT_SECRET ||
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_CALLBACK_URL
) {
  throw new Error("Required environment variables are not defined");
}

const googleStrategyOptions: StrategyOptionsWithRequest = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  passReqToCallback: true,
};

passport.use(
  new GoogleStrategy(
    googleStrategyOptions,
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any, info?: any) => void
    ) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in Google profile"), false);
        }
        const email = profile.emails[0].value.toString();

        let users: User[] = await prisma.user.findMany({
          where: { email_address: email },
        });

        let user: User | null = null;
        if (users.length > 0) {
          user = users[0];
        } else {
          console.log(`User not found, creating new user with email: ${email}`);
          user = await prisma.user.create({
            data: {
              display_name: profile.displayName,
              email_address: email,
              password: "google_oauth", // Use a dummy value since OAuth doesn't provide passwords
              about_me: "placeholder",
              location: "placeholder",
            },
          });
          console.log("User created:", user);
        }

        // Attach returnTo to the req object so it can be used later in the callback
        (req as any).returnTo = req.query.state;
        console.log("User found or created:", user);
        return done(null, user);
      } catch (err) {
        console.error("Error creating or finding user:", err); // Log the error for debugging
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id: number, done: (err: any, user?: any) => void) => {
    try {
      console.log(id);
      const user = await prisma.user.findMany({
        where: { id: Number(id) },
      });
      console.log("ERRROR", user[0]);
      done(null, user[0]);
    } catch (err) {
      done(err, null);
    }
  }
);

export const initializePassport = () => passport.initialize();
export const sessionPassport = () => passport.session();

export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
  failureRedirect: "/api/users/google",
});

export const authenticateGoogleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("google", (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/api/users/google");
    }
    req.logIn(user, (err: any) => {
      if (err) {
        return next(err);
      }
      // Redirect to a default route after successful login
      res.redirect("/api/questions/user-questions");
    });
  })(req, res, next);
};
