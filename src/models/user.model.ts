import { getDB } from "../config/db.js";

export const usersCollection = () => getDB().collection("users");