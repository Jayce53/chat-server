/**
 * This returns the page of login links
 */
import {Application, Request, Response} from "express";
import fs from "fs";

// noinspection JSUnusedGlobalSymbols
export function routeSetup(app: Application): void {
  console.log("setup route: /api/testlogin");
  app.get("/api/testlogin", (req: Request, res: Response): void => {
    console.log("/api/testlogin");
    const html = fs.readFileSync("/usr/server/src/data/flirtable.html", "utf8");
    res.send(html);
  });
}
