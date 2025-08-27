import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import addLog from "../config/addLog";

const IGNORED_METHODS = ["GET", "HEAD", "OPTIONS"];

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (IGNORED_METHODS.includes(req.method)) {
      if (!req.cookies["csrf-token"]) {
        const token = crypto.randomBytes(24).toString("hex");
        res.cookie("csrf-token", token, {
          httpOnly: false,
          sameSite: "strict",
        });
      }
      return next();
    }

    const tokenFromCookie = req.cookies["csrf-token"];
    const tokenFromHeader = req.header("x-csrf-token");
    if (tokenFromCookie && tokenFromHeader && tokenFromCookie === tokenFromHeader) {
      return next();
    }
    addLog(`CSRF token mismatch`, "error");
    return res.status(403).json({
      code: 403,
      success: false,
      message: "Invalid CSRF token",
    });
  } catch (error) {
    addLog(error, "error");
    return res.status(500).json({
      code: 500,
      success: false,
      message: "CSRF protection error",
    });
  }
};
