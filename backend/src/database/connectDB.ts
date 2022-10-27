import { MongoClient } from "https://deno.land/x/mongo@v0.30.0/mod.ts";

// TODO: Design for failure.
class DatabaseNotAvailableError extends Error {}

const dbString = 'mongodb://localhost:27017';
const client = new MongoClient();
try {
    await client.connect(dbString);
} catch (error) {
    console.log('Database connection error: ', error)
    throw new DatabaseNotAvailableError()
}
const db = client.database("deno_auth");
export default db;

