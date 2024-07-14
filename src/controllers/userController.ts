import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { UserData } from "../models/userModel";

export const registerUser = async (
  req: Request<{}, {}, UserData>,
  res: Response
) => {
  try {
    const { displayName, emailAddress, password, aboutMe, location } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email_address: emailAddress },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        display_name: displayName,
        email_address: emailAddress,
        password: hashedPassword,
        about_me: aboutMe,
        location: location,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};

export const loginUser = async (
  req: Request<{}, {}, { emailAddress: string; password: string }>,
  res: Response
) => {
  try {
    const { emailAddress, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email_address: emailAddress },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
};
