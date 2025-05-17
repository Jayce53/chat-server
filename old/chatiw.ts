/**
 * This is the endpoint that gets called from chatiw so that we can save the chatiw users
 */
import {Application, Request, Response} from "express";
import {db} from "@/classes/Database";

// import {globals} from "@/global";

interface OriginalUser {
  user_id: number;
  sex: "Male" | "Female",
  nickname: string;
  state: string;
  country_code: string;
  country_name: string;
  age: number;
}

interface User {
  id: number;
  gender: "M" | "F",
  nickname: string;
  coCode: string;
  age: number;
  locality: string;
  // inserted: number;
  // removed: number;
  // deleteme: boolean;
}

// interface OnlineUsers {
//   html: OriginalUser[];
//   online_number: number;
// }

interface Document {
  timestamp: number;
  users: User[];
}

export function routeSetup(app: Application): void {
  console.log("setup route: /api/chatiw");
  app.post("/api/chatiw", async (req: Request, res: Response): Promise<void> => {
    const usersDocument: Document = {timestamp : Date.now(), users : []};
    console.log("Receiving chatiw users");
    req.body.html.forEach((originalUser: OriginalUser): void => {
      const newUser: User = {
        id       : originalUser.user_id,
        nickname : originalUser.nickname,
        age      : originalUser.age,
        coCode   : originalUser.country_code.toUpperCase(),
        gender   : originalUser.sex.charAt(0).toUpperCase() as "M" | "F",
        locality : originalUser.state,
        // inserted : runTimestamp,
        // removed  : 0,
        // deleteme : false
      };
      usersDocument.users.push(newUser);
    });
    // noinspection ES6MissingAwait
    db.insertOne("chatiw", usersDocument);
    res.send("OK");
  });
}
