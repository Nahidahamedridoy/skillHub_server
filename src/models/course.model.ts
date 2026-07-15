import { getDB } from "../config/db.js";

export const coursesCollection = () => getDB().collection("courses");