import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

const isProduction = process.env.NODE_ENV === "production";

export async function register(req: Request, res: Response) {
  try {
    const { token, user } = await registerUser(req.body);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:");
    console.error(error);
    console.error(error?.stack);

    return res.status(400).json({
      success: false,
      message: error?.message || "Registration failed",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { token, user } = await loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:");
    console.error(error);

    return res.status(401).json({
      success: false,
      message: error?.message || "Login failed",
    });
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

export async function me(req: Request, res: Response) {
  try {
    const user = await getCurrentUser(req.user!.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("ME ERROR:");
    console.error(error);

    return res.status(404).json({
      success: false,
      message: error?.message || "User not found",
    });
  }
}