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

interface LoginUser {
  email: string;
  password: string;
}

export async function registerUser(user: RegisterUser) {
  try {
    console.log("========== REGISTER ==========");
    console.log(user);

    const { name, email, password, role: rawRole } = user;

    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const role: UserRole =
      rawRole && ALLOWED_ROLES.includes(rawRole as UserRole)
        ? (rawRole as UserRole)
        : "student";

    console.log("Checking existing user...");

    const existingUser = await usersCollection().findOne({ email });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    console.log("Hashing password...");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Saving user...");

    const result = await usersCollection().insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Creating JWT...");

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: result.insertedId.toString(),
        name,
        email,
        role,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    console.log("Registration Success");

    return {
      token,
      user: {
        _id: result.insertedId,
        name,
        email,
        role,
      },
    };
  } catch (error) {
    console.error("REGISTER SERVICE ERROR");
    console.error(error);
    throw error;
  }
}

export async function loginUser(credentials: LoginUser) {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error("All fields are required");
    }

    const user = await usersCollection().findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      secret,
      {
        expiresIn: "7d",
      }
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
  } catch (error) {
    console.error("LOGIN SERVICE ERROR");
    console.error(error);
    throw error;
  }
}

export async function getCurrentUser(userId: string) {
  try {
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
  } catch (error) {
    console.error("GET CURRENT USER ERROR");
    console.error(error);
    throw error;
  }
}