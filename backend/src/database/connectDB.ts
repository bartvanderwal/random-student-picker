import { MongoClient } from "https://deno.land/x/mongo@v0.30.0/mod.ts";

// TODO: Design for failure. Beter omgaan met database tijdelijk offline?
class DatabaseNotAvailableError extends Error {}
const defaultDatabaseUrl = "mongodb://localhost:27017"
const databaseUrl = Deno.env.get("DATABASE_URL") || defaultDatabaseUrl;
const client = new MongoClient();
try {
    await client.connect(databaseUrl);
} catch (error) {
    console.log('Database connection error: ', error)
    throw new DatabaseNotAvailableError(`The database doesn't seem to be running. Start the mongodb server at ${databaseUrl}`)
}
const db = client.database("deno_auth");
export default db;

