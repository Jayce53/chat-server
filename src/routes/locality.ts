/**
 * This gets & returns the localities from a country code
 */

import {Request, Response, Application} from "express";
import {db} from "@/classes/Database";

// FIXME - define the database schema so we don't have this translate of language names to numbers
// noinspection JSUnusedGlobalSymbols
export function routeSetup(app: Application): void {
  console.log("setup route: /api/locality/:coCode");
  app.get("/api/locality/:coCode", (req: Request, res: Response): void => {
    console.log(`/api/locality/${req.params.coCode}`);
    db.readOne("locality", {_id : req.params.coCode})
      .then((data) => {
        if (!data) {
          throw new Error(`No locality data found for "${req.params.coCode}"`);
        }
        res.send({localities : data.localities, languages : data.languages});
      })
      .catch((error) => {
        console.error("Database read error:", error);
        res.status(500).send("Internal Server Error");
      });
  });
}
