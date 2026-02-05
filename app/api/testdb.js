import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  try {
    await client.connect();
    res.status(200).json({ message: "Successfully connected to MongoDB!" });
  } catch (error) {
    res.status(500).json({ error: "Connection failed: " + error.message });
  } finally {
    await client.close();
  }
}