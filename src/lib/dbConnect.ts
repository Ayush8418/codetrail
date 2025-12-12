import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Cached connection for MongoDB (stored in globalThis to survive hot reloads)
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the NodeJS global type so TypeScript knows about global.mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached; // store back to global cache

  return cached.conn;
}

export default dbConnect;
