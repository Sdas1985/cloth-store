import mongoose from 'mongoose';

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roxy_cloth_store';

let isConnected = false;
let useMemoryFallback = false;
let connectionPromise: Promise<{ isConnected: boolean; isFallback: boolean }> | null = null;

export async function connectToDatabase(): Promise<{ isConnected: boolean; isFallback: boolean }> {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    // If readyState is already 1, we are connected
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      useMemoryFallback = false;
      return { isConnected: true, isFallback: false };
    }

    try {
      mongoose.set('bufferCommands', false);
      // Attempt Mongoose connection with fast 1.5s timeout for local preview
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500,
        bufferCommands: false,
      });

      if ((mongoose.connection.readyState as number) === 1) {
        isConnected = true;
        useMemoryFallback = false;
        console.log(`[MongoDB] Connected to database: ${mongoose.connection.name || 'roxy_cloth_store'}`);
        return { isConnected: true, isFallback: false };
      } else {
        throw new Error('Mongoose readyState is not 1');
      }
    } catch (err: any) {
      console.warn(`[MongoDB Notice] MongoDB not active at "${MONGODB_URI}".`);
      console.log('[MongoDB Fast-Fallback] In-memory high-speed store activated (instant sub-millisecond response).');
      isConnected = false;
      useMemoryFallback = true;
      return { isConnected: false, isFallback: true };
    }
  })();

  return connectionPromise;
}

export function isFallbackMode(): boolean {
  return useMemoryFallback || mongoose.connection.readyState !== 1;
}

export { mongoose };
