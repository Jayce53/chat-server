import {Application} from "express";
import fs from "fs";
import * as os from "os";
import path from "path";
import {fileURLToPath} from "url";

interface RouteModule {
  routeSetup: (app: Application) => void;
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePrefix = os.platform() === "win32" ? "file://" : "";

async function setupRoutes(app: Application) {
  const routesDir = path.join(__dirname, "./routes");
  const routeFiles = fs.readdirSync(routesDir);

  console.log("Importing route handlers: ", routeFiles);

  const routePromises = routeFiles
    .filter((file) => {
      return file.endsWith(".ts");
    })
    .map((file) => {
      console.log("Importing route handler: ", `${filePrefix}${path.join(routesDir, file)}`);
      return import(`${filePrefix}${path.join(routesDir, file)}`);
    });

  const routeModules = await Promise.all(routePromises);

  routeModules.forEach((module: RouteModule) => {
    if (module.routeSetup) {
      module.routeSetup(app);
    }
  });
  console.log("Route handlers loaded");
}

export {setupRoutes};
