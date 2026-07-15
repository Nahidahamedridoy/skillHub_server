import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let connected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }

    return app(req, res);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: String(err),
    });
  }
}