import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import fs from 'fs';

let client: MongoClient | null = null;

async function connectToDatabase(): Promise<Db> {
  try {
    // Return a mock database during build time
    if (typeof window !== 'undefined' ||
        process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.NODE_ENV === 'test') {
      return {
        collection: () => ({
          findOne: () => Promise.resolve(null),
          insertOne: () => Promise.resolve({ insertedId: 'mock-id' })
        })
      } as unknown as Db;
    }

    // Initialize client if not already done
    if (!client) {
      // Load environment variables at runtime
      const env = process.env.NODE_ENV || 'development';
      const uri = env === 'production' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV;

      if (!uri) {
        throw new Error(`MongoDB URI not found for ${env} environment`);
      }

      // Configure MongoDB client based on environment
      const clientOptions: MongoClientOptions = {
        tls: true,
        authMechanism: 'MONGODB-X509',
      };

      // In production, use the certificate from environment variable
      if (env === 'production') {
        if (!process.env.MONGODB_X509_CERT) {
          throw new Error('Production MongoDB X509 certificate not found in environment variables');
        }
        clientOptions.tlsCertificateKeyFile = Buffer.from(
          process.env.MONGODB_X509_CERT,
          'base64'
        ).toString();
      } else {
        // In development, use the certificate file
        const certPath = process.env.MONGODB_X509_CERT_PATH_DEV;
        if (!certPath) {
          throw new Error('Development certificate path not found in environment variables');
        }
        clientOptions.tlsCertificateKeyFile = certPath;
      }

      client = new MongoClient(uri, clientOptions);
    }

    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('sunday-night-games');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

export default connectToDatabase; 