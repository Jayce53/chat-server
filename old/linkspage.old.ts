/**
 * The linkspage module is responsible for generating a page of links.
 * It connects to a MongoDB database, retrieves user data from the "user" collection, and generates a page of links based on the user data.
 * It is called from server.ts and runs before the server starts if we are in dev mode
 *
 * The result is accessed via http://localhost/api/testlogin
 */
import fs from "fs";
import {Collection, FindCursor, MongoClient} from "mongodb";
import {User} from "@/classes/User";
import {generateToken} from "@/token";

const dbUser = "flirtable";
const dbPassword = "fla11ppGHM!99";
const dbDatabase = "flirtable";
// const dbNetwork = "localhost";
const dbNetwork = "flirtable-mongo";

// const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}`;
const uri = `mongodb://${dbUser}:${dbPassword}@${dbNetwork}:27017/${dbDatabase}?authSource=admin`;

const client = new MongoClient(uri);

export const linksPage = async () => {
  try {
    console.log("links calling connect()");
    await client.connect();
    console.log("links called connect()");

    const database = client.db("flirtable"); // Replace 'your_database_name' with your database name
    const collection : Collection<User> = database.collection<User>("user"); // Replace 'your_collection_name' with your collection name

    // Find documents in the collection and sort by _id
    const cursor : FindCursor<User> = collection.find().sort({_id : 1});

    const userData = await cursor.toArray();
    console.log(`User count: ${userData.length}`);
    /**
     * Now generate a page of links so we can login as each user
     */
    const html = `<html>
    <head>
    <title>Flirtable test data</title>
    </head>
    <body>
`;
    const newHtml : string = `${userData.reduce((acc, user : User) => {
      const token = generateToken({...user.publicUser, _id : user._id});
      return `${acc}<a href="https://localhost/chat/?token=${token}" target="_blank"  onclick="window.open(this.href + '&t=' + Date.now(), '_blank'); return false;">${user.publicUser.nickname}</a><br>
    `;
    }, html)}
</body>
</html>`;

    console.log("Writing html");
    fs.writeFileSync("/usr/server/src/data/flirtable.html", newHtml, "utf8");
  } catch (err : any) {
    console.error(err);
  }
  console.log("Finished linksPage()");
  await client.close();
};
