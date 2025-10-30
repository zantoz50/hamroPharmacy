'use strict';

const { MongoClient } = require('mongodb');

(async () => {
  try {
    const uri = process.env.MONGO_URI || `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}`;
    const dbName = process.env.MONGO_DB || 'hamroPharacy';
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Ensure indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('patients').createIndex({ patient_id: 1 }, { unique: true });

    console.log('Mongo init completed');
    await client.close();
  } catch (err) {
    console.error('Mongo init failed', err);
    process.exit(1);
  }
})();
