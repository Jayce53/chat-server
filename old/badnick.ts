/**
 * This handles a get from chatiw
 *
 * It passes a bad nick which we'll write to the DB
 * If all is OK, we'll add the new user
 */
import {Application, Request, Response} from "express";


// TODO - check for garbage in the input
// noinspection JSUnusedGlobalSymbols
export function routeSetup(app: Application): void {
  console.log("setup route: /api/badnick");
  app.get("/api/badnick", async (req: Request<{}, {}, Record<any, any>>, res: Response): Promise<void> => {
    console.log("/api/badnick");

    res.send();
  });
}
