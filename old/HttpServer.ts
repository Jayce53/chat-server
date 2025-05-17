/**
 * This handles creating and intitialize the http server
 * Includes setting up the session middleware
 */
import express, {Application} from "express";
import {createServer, Server} from "http";
import session from "express-session";
import cors from "cors";
import fs from "fs";
import path from "path";

// Define the interface for route modules
interface RouteModule {
  routeSetup: (app: Application) => void;
}

const app: Application = express();

app.set("trust proxy", 1);

app.use("/api", cors({
  origin         : (origin, callback) => {
    callback(null, origin);
  },
  credentials    : true,
  exposedHeaders : ["X-Powered-By", "Server", "Date", "Set-Cookie"],
}));

app.use(express.json());

const sessionMiddleware = session({
  secret            : "your-secret-key",
  resave            : false,
  saveUninitialized : true,
  cookie            : {
    secure   : true,
    sameSite : "none"
  }
});
app.use(sessionMiddleware);

const httpServer: Server = createServer(app);

async function registerRouteHandlers() {
  const routesDir = path.join(__dirname, "src/routes");
  const routeFiles = fs.readdirSync(routesDir);

  // Create an array of promises for importing the route modules
  const routePromises: Promise<RouteModule>[] = routeFiles
    .filter((file) => file.endsWith(".ts")) // Filter only .ts files
    .map((file) => import(path.join(routesDir, file)));

  // Await all the promises to resolve
  const routeModules = await Promise.all(routePromises);

  // Set up routes for each module
  routeModules.forEach((routeModule) => {
    routeModule.routeSetup(app);
  });
}

registerRouteHandlers()
  .then(() => {
  })
  .catch((err) => {
    console.error("Error registering route handlers:", err);
  });

export {httpServer, sessionMiddleware};
