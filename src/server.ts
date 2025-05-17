import {createServer, Server} from "http";
import * as process from "process";
import maxmind, {CityResponse} from "maxmind";
import {Application} from "express";
import * as os from "os";
import {config} from "./config";
import {setupApp} from "@/appSetup";
import {initializeWebSocketServer} from "./WebSocketServer";
import {setupRoutes} from "./routeSetup";
import {linksPage} from "@/utility/linkspage";
import {reloadData} from "./utility/loaddata";
import {db} from "./classes/Database";
import {globals} from "@/global";
import {User} from "@/classes/User";
import {userStore} from "@/classes/UserStore";
import {setIO} from "@/store";
// import * as formidible from "formidable";
// import {IncomingForm} from "formidable";
// import path from "path";
/**
 * The starting point of the server
 * Connects to the database and starts the HTTP and socket servers
 * @module main
 */
const devMode = process.env.ENV === "development";
const platform = os.platform();

console.log(`ChatServer starts in ${devMode ? "development" : "production"} mode`);


/**
 * If we are in dev mode, then we reload the database from the test data files
 */
if (devMode) {
  globals.devMode = true;
  await reloadData();
  // await fixLocality();
  // await fixUser();
  await linksPage();
}
const maxMindDB = platform === "win32" ? "./data/GeoLite2-City.mmdb" : "/usr/server/src/data/GeoLite2-City.mmdb";
const reader = await maxmind.open<CityResponse>(maxMindDB);
globals.ipLookup = reader.get.bind(reader);

console.log("Connecting to MongoDB");
await db.connect();

console.log("Load existing data");
const existingUsers = (await db.readMany("user", {})) as unknown as User[];
// console.log(existingUsers);
userStore.load(existingUsers);
console.log("Existing data loaded");

const app : Application = setupApp();
await setupRoutes(app);

// FIXME - log this
app.use((req, res, _next) => {
  if (req.xhr) {
    console.log(`xhr 404 ${req.url}`);
    res.status(404).json({ message: 'This was an XHR request.' });
  } else {
    console.log(`Broswer 404 ${req.url}`);
    res.status(404).send('<h1>This was a browser request.</h1>');
  }
});

userStore.startExpiredMonitor();

/**
 * Create the http server
 */
const server : Server = createServer(app);

/**
 * Add the websocket server to the http server and setup the event handlers
 * Also save the io instance in a store so we can access it from anywhere
 */
setIO(await initializeWebSocketServer(server));

server.listen(config.SERVER_PORT, () => {
  console.log(`Chat Server is running on port ${config.SERVER_PORT}`);
});
