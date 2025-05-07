/**
 * CreditBoost V2.0 Migration
 * Update User Schema
 * 
 * This migration adds new fields to the user schema for enhanced security and features.
 */

// Example migration script - adapt to your actual database setup
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../../api/.env' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const database = client.db('creditboost');
    const users = database.collection('users');
    
    // Add new fields to all users
    const updateResult = await users.updateMany(
      {}, // Match all documents
      {
        $set: {
          securityVersion: 2,
          lastPasswordChange: new Date(),
          requiredMfa: false,
          knownDevices: [],
          securityPreferences: {
            enableMfa: false,
            notifyOnNewDevice: true,
            notifyOnPasswordChange: true
          }
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: false }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} users`);
    
    // Create index for device fingerprints
    await users.createIndex({ "knownDevices.fingerprint": 1 });
    console.log('Created index for device fingerprints');
    
    // Create index for email (if not exists)
    await users.createIndex({ "email": 1 }, { unique: true });
    console.log('Created index for email');
    
    console.log('Migration completed successfully');
  } finally {
    await client.close();
  }
}

// Run migration
migrate().catch(console.error);