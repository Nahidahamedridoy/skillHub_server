import { getDB } from "../config/db.js";

export const usersCollection = async () => {
  const db = await getDB();
  return db.collection("users");
};