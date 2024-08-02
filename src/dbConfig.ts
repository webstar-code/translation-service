import { MongoClient } from "mongodb";
import { createClient } from 'redis';

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const redisClient = createClient({});



async function connectToDatabase() {
  try {
    await client.connect();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log(redisClient.isReady)

    redisClient.on('error', async (err) => {
      console.log('Redis Client Error', err)
    });

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      `Connected successfully to ${uri?.startsWith("mongodb+srv") ? "Cloud" : "Local"
      } database`
    );
  } finally {
    // Ensures that the client will close when you finish / error
    // await client.close();
  }
}

export const messages = client.db("chat-app").collection("messages")
export const conversations = client.db("chat-app").collection("conversations")
export const chatSessions = client.db("chat-app").collection("user-chat-sessions")
export const movies = client.db("sample_mflix").collection("movies")

export {
  connectToDatabase,
  client,
  redisClient
};