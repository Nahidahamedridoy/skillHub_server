import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { usersCollection } from "../models/user.model.js";

type UserRole = "student" | "instructor";

const ALLOWED_ROLES: UserRole[] = ["student", "instructor"];

interface RegisterUser {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export async function registerUser(user: RegisterUser) {
  const { name, email, password, role: rawRole } = user;

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  // Role validation
  if (rawRole === "admin") {
    throw new Error("Admin registration is not allowed");
  }

  const role: UserRole =
    rawRole && ALLOWED_ROLES.includes(rawRole as UserRole)
      ? (rawRole as UserRole)
      : "student";

  const existingUser = await usersCollection().findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save User
  const result = await usersCollection().insertOne({
    name,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
  });

  return {
    id: result.insertedId,
    name,
    email,
    role,
  };
}

interface LoginUser {
  email: string;
  password: string;
}

export async function getCurrentUser(userId: string) {
  const user = await usersCollection().findOne(
    {
      _id: new ObjectId(userId),
    },
    {
      projection: {
        password: 0,
      },
    }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function loginUser(credentials: LoginUser) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("All fields are required");
  }

  // Find user by email
  const user = await usersCollection().findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password as string);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}