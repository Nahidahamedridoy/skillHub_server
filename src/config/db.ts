import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.DB_URI!;

if (!uri) {
  throw new Error("DB_URI is missing.");
}

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

export async function getDB(): Promise<Db> {
  if (db) return db;

  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await global._mongoClient.connect();

    console.log("✅ MongoDB Connected");
  }

  client = global._mongoClient;
  db = client.db("skill_hub");

  return db;
}