import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  clientPromise = null;
}

export default clientPromise;

export async function isMongoConnected(): Promise<boolean> {
  if (!clientPromise) return false;
  try {
    const connectedClient = await clientPromise;
    await connectedClient.db("dail-tracking").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db("dail-tracking");
  } catch (err) {
    console.error("Failed to get MongoDB db:", err);
    return null;
  }
}
