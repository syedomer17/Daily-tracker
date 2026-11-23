import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 4000,
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
    await connectedClient.db().command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
