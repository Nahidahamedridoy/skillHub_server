import { Db, MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectDB() {
  const uri = process.env.DB_URI;

  if (!uri) {
    throw new Error("❌ DB_URI is missing in .env");
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  // await client.connect();
  // await client.db("admin").command({ ping: 1 });

  db = client.db("skill_hub");

  console.log("✅ MongoDB Connected Successfully");
}

export function getDB() {
  if (!db) {
    throw new Error("Database is not connected.");
  }

  return db;
}