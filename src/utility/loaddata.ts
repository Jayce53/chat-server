/**
 * This file is used to load the test data into the MongoDB database.
 * It is not used in production.
 */

import fs from "fs";
import {Db, MongoClient} from "mongodb";
import {User} from "@/classes/User";

type IdData = {
  _id: string;
  value: number;
};
type IdDataArray = IdData[];

interface LocalityData {
  _id: string;
  localities: string[];
  languages: string[];
}

type LocalityDataArray = LocalityData[];

type UserDataArray = User[];

async function reloadData() {
  // const dbUser = "jayce";
  // const dbPassword = "ila11ppGHM!99";
  // const dbDatabase = "admin";

  const dbUser = "flirtable";
  const dbPassword = "fla11ppGHM!99";
  const dbDatabase = "flirtable"; // Use the correct database

  const dbNetwork = "flirtable-mongo";

  console.log("Test data: loading...");
//  const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}`;
  const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}?authSource=admin`;
  console.log(`uri: ${uri}`);

  const dbClient = new MongoClient(uri);
  const db: Db = dbClient.db("flirtable");

  await dbClient.connect();
  console.log("db connected");

  let jsonData;
  let result;
  let collection;
  let insertMany;

  /**
   * Clear the uploaded images
   */
  result = await db.dropCollection("images");
  console.log("dropped images: ", result);

  collection = await db.createCollection("images");
  console.log("create images: ", collection !== null);

  /**
   * Clear conversation data
   */
  result = await db.dropCollection("conversation");
  console.log("dropped conversation: ", result);

  collection = await db.createCollection("conversation");
  console.log("create conversation: ", collection !== null);

  await collection.createIndex({participants : 1});
  /**
   * Load the ID data
   */
  jsonData = fs.readFileSync("/usr/server/src/data/flirtable.id.json", "utf8");
  const idData: IdDataArray = JSON.parse(jsonData);

  result = await db.dropCollection("id");
  console.log("dropped id: ", result);

  collection = await db.createCollection("id");
  console.log("create id: ", collection !== null);

  // @ts-expect-error It works
  insertMany = await collection.insertMany(idData);
  console.log(`insert id: ${insertMany.acknowledged} count=${insertMany.insertedCount}`);

  /**
   * Load the user data
   */
  jsonData = fs.readFileSync("/usr/server/src/data/flirtable.user.json", "utf8");
  const userData: UserDataArray = JSON.parse(jsonData);

  userData.forEach((user: User) => {
    user.publicUser.nickname = user.publicUser.nickname.trim();
    user.privateUser.uploadedFiles = {};
  });

  result = await db.dropCollection("user");
  console.log("dropped user: ", result);

  collection = await db.createCollection("user");
  console.log("create user: ", collection !== null);

// @ts-expect-error It works
  insertMany = await collection.insertMany(userData);
  console.log(`insert user: ${insertMany.acknowledged} count=${insertMany.insertedCount}`);

  /**
   * Load the locality data
   */
  jsonData = fs.readFileSync("/usr/server/src/data/flirtable.locality.json", "utf8");
  const localityDataArray: LocalityDataArray = JSON.parse(jsonData);

  result = await db.dropCollection("locality");
  console.log("dropped locality: ", result);

  collection = await db.createCollection("locality");
  console.log("create locality: ", collection !== null);

  // @ts-expect-error It works
  await collection.insertMany(localityDataArray);


  await dbClient.close();
  console.log("Test data load finished");
}

export {reloadData};
