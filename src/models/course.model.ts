import { getDB } from "../config/db.js";

export const coursesCollection = async () => {
  const db = await getDB();
  return db.collection("courses");
};