import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const uri = env === 'production' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV;
const certPath = env === 'production' ? process.env.MONGODB_X509_CERT_PATH_PROD : process.env.MONGODB_X509_CERT_PATH_DEV;

const client = new MongoClient(uri, {
  tls: true,
  tlsCertificateKeyFile: certPath,
  authMechanism: 'MONGODB-X509',
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

export default connectToDatabase;
