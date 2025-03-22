import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

interface CachedConnection {
  client: MongoClient | null;
  db: Db | null;
}

let cachedConnection: CachedConnection = {
  client: null,
  db: null
};

export async function connectToDatabase(): Promise<CachedConnection> {
  if (cachedConnection.client && cachedConnection.db) {
    return cachedConnection;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedConnection.client = client;
  cachedConnection.db = db;

  return { client, db };
}