import { getDB } from "../config/db.js";

export const enrollmentsCollection = () => getDB().collection("enrollments");
