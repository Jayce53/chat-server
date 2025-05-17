/**
 * This reads through the locality collection and updates the languages field to use numeric language codes
 *
 * Then it reads through the users and adds a languages field to each user
 */
import fs from "fs";
import {MongoClient, Collection, FindCursor} from "mongodb";
import {User} from "@/classes/User";

// Define the shape of your document
interface LocalityDocument {
  _id: string;
  localities: string[];
  languages: string[] | number[];
}

interface Languages {
  [key: string]: string;
}

interface LanguageData {
  [key: string]: Languages;
}

let jsonData = fs.readFileSync("/usr/server/src/data/alllanguages.json", "utf8");
const allLanguages: string[] = JSON.parse(jsonData);

const allLanguagesMap: Map<string, number> = new Map();

allLanguages.forEach((lang, ix: number) => {
  allLanguagesMap.set(lang, ix);
});


jsonData = fs.readFileSync("/usr/server/src/data/languageData.json", "utf8");
const languageData: LanguageData = JSON.parse(jsonData);


const dbUser = "flirtable";
const dbPassword = "fla11ppGHM!99";
const dbDatabase = "flirtable";
// const dbNetwork = "localhost";
const dbNetwork = "flirtable-mongo";

const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}`;

const client = new MongoClient(uri);

export async function fixLocality() {
  try {
    await client.connect();

    const database = client.db("flirtable"); // Replace 'your_database_name' with your database name
    const collection: Collection<LocalityDocument> = database.collection<LocalityDocument>("locality"); // Replace 'your_collection_name' with your collection name

    // Find documents in the collection and sort by _id
    const cursor: FindCursor<LocalityDocument> = collection.find().sort({_id : 1});

    console.log(`count: ${await collection.estimatedDocumentCount()}`);
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for await (const document of cursor) {
      if (!languageData[document._id]) {
        console.log(`No languages for ${document._id}`);
        // eslint-disable-next-line no-continue
        continue;
      }
      const newLanguages: number[] = [];
      Object.values(languageData[document._id]).forEach((lang) => {
        const langIx = allLanguagesMap.get(lang);
        if (langIx === undefined) {
          console.log(`No index for ${lang}`);
        } else {
          newLanguages.push(langIx);
        }
      });
      // if (!document.languages) {
      //   console.log(`No languages for ${document._id}`);
      // }
      // console.log(document._id, document.languages);
      // const newLanguages: number[] = [];
      const result = await collection.updateOne({_id : document._id}, {$set : {languages : newLanguages}});
      if (result.modifiedCount !== 1) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Error updating ${document._id}`);
      }
    }
  } catch (error) {
    console.error("Error reading collection:", error);
  } finally {
    console.log("Finished fixLocality()");
    await client.close();
  }
}

/**
 * This reads through the user collection and adds a languages field to each user
 */
export async function fixUser() {
  try {
    await client.connect();

    const database = client.db("flirtable"); // Replace 'your_database_name' with your database name
    const collection: Collection<User> = database.collection<User>("user"); // Replace 'your_collection_name' with your collection name

    // Find documents in the collection and sort by _id
    const cursor: FindCursor<User> = collection.find().sort({_id : 1});

    console.log(`count: ${await collection.estimatedDocumentCount()}`);
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for await (const document: UserClient of cursor) {
      if (document.publicUser.languages) {
        console.log(`Already has languages: ${document._id}`);
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!document.publicUser.coCode) {
        console.log(`No coCode for ${document._id}`);
        // eslint-disable-next-line no-continue
        continue;
      }
      const lang = Object.values(languageData[document.publicUser.coCode])[0];
      const langIx = allLanguagesMap.get(lang);
      if (langIx === undefined) {
        console.log(`No index for ${lang}`);
        // eslint-disable-next-line no-continue
        continue;
      }
      const languages = document._id === 1272 ? [31, 38] : [langIx];
      const result = await collection.updateOne({_id : document._id}, {$set : {"publicUser.languages" : languages}});
      if (result.modifiedCount !== 1) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Error updating ${document._id}`);
      }
//      console.log(languageData[document.publicUser.coCode]);
    }
  } catch (error) {
    console.error("Error reading collection:", error);
  } finally {
    console.log("Finished fixUser()");
    await client.close();
  }
}
