import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
export const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || "deen_dunya_tracker";

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let indexesInitialized = false;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoIndexesInitialized: boolean | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
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

/**
 * Returns the MongoDB Database instance using the configured database name.
 */
export async function getDb(dbName: string = DEFAULT_DB_NAME): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db(dbName);

    // Initialize required indexes once
    if (!indexesInitialized && !global._mongoIndexesInitialized) {
      ensureDatabaseIndexes(db).catch(() => {
        // Log index creation error in background without blocking queries
      });
      indexesInitialized = true;
      global._mongoIndexesInitialized = true;
    }

    return db;
  } catch {
    return null;
  }
}

/**
 * Ensures unique and search indexes are properly established for multi-tenant data isolation.
 */
export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  try {
    // 1. Users collection: unique provider + providerAccountId, and unique email
    await db.collection("users").createIndex(
      { provider: 1, providerAccountId: 1 },
      { unique: true, background: true }
    );
    await db.collection("users").createIndex(
      { email: 1 },
      { unique: true, sparse: true, background: true }
    );

    // 2. User tracker state: strictly unique per authenticated user ID
    await db.collection("user_tracker_state").createIndex(
      { userId: 1 },
      { unique: true, background: true }
    );

    // 2b. User normalized daily records: unique per (userId + date)
    await db.collection("user_daily_records").createIndex(
      { userId: 1, date: 1 },
      { unique: true, background: true }
    );
    await db.collection("user_daily_records").createIndex(
      { userId: 1, date: -1 },
      { background: true }
    );

    // 3. User custom timetables: strictly unique per authenticated user ID
    await db.collection("user_timetables").createIndex(
      { userId: 1 },
      { unique: true, background: true }
    );

    // 4. User daily reviews: compound unique index on (userId + date) to prevent duplicates
    await db.collection("user_reviews").createIndex(
      { userId: 1, date: 1 },
      { unique: true, background: true }
    );

    // 5. Legacy backups collection: index on timestamp for audits
    await db.collection("legacy_backups").createIndex(
      { backedUpAt: -1 },
      { background: true }
    );
  } catch {
    // Gracefully ignore index creation errors in read-only or restricted setups
  }
}

/**
 * Safe ping check to determine if MongoDB is active and reachable.
 */
export async function isMongoConnected(dbName: string = DEFAULT_DB_NAME): Promise<boolean> {
  if (!clientPromise) return false;
  try {
    const connectedClient = await clientPromise;
    await connectedClient.db(dbName).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
