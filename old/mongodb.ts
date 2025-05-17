// TODO Move this to dbOperations

import {Db, MongoClient} from "mongodb";

const dbUser = "flirtable";
const dbPassword = "fla11ppGHM!99";
const dbDatabase = "flirtable";
const dbNetwork = "flirtable-mongo";
// const dbNetwork = "localhost";

const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}`;

const dbClient = new MongoClient(uri);
// eslint-disable-next-line import/no-mutable-exports
let db: Db = null as unknown as Db;

const dbConnect = async (): Promise<void> => {
  try {
    await dbClient.connect();
    db = dbClient.db();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};


// noinspection JSUnusedGlobalSymbols
async function dbDisconnect(): Promise<void> {
  await dbClient.close();
  console.log("Disconnected from MongoDB");
}

export {dbConnect, dbDisconnect, db};
