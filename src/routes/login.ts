/**
 * This handles a submit from the profile page
 *
 * We should verify that the data isn't dodgy again
 *
 * This could either be a new user (not on DB) or a returning user (is on DB)
 * If it's a returning user, we'll update the user's status
 * If it's a new user, we'll add the user to the DB with a status of WAITING
 *
 * If all is OK, we'll add the new user
 */
import {Application, Request, Response} from "express";
import {User, UserGender, UserStatus} from "@/classes/User";
import {ip2int, userStore} from "@/classes/UserStore";
import {getNextId} from "@/getNextId";
import {generateToken} from "@/token";


interface LoginBody {
  nickname : string;
  age : number;
  gender : UserGender;
  coCode : string;
  locality : string;
  languages : number[];
}

// FIXME - check sanity of input
// noinspection JSUnusedGlobalSymbols
export function routeSetup(app : Application) : void {
  console.log("setup route: /api/login");
  app.post("/api/login", async (req : Request<object, object, LoginBody>, res : Response) : Promise<void> => {
    console.log("/api/login");

    const ip = req.header("X-Real-IP") ?? "0.0.0.0";
    const nextId = await getNextId("user");
    console.log(`nextID: ${nextId}`);

    const newUser : User = {
      _id         : nextId,
      publicUser  : {
        nickname  : req.body.nickname,
        age       : req.body.age,
        gender    : req.body.gender,
        coCode    : req.body.coCode,
        locality  : req.body.locality,
        languages : req.body.languages,
        status    : UserStatus.CONNECTED,  // FIXME - should be WAITING?
      },
      privateUser : {
        loginTs       : Date.now(),
        loginIp       : ip2int(ip),
        uploadedFiles : {},
        disconnectTs  : 0,
      },
    };

    await userStore.insert(newUser);
    res.cookie("token", generateToken({_id : newUser._id, ...newUser.publicUser}), {maxAge : 7 * 24 * 60 * 60 * 1000, httpOnly : true, sameSite : "none", secure : true});
    console.log(`Added user ${newUser._id} ${newUser.publicUser.nickname} new size: ${userStore.getUserCount()}`);
    const clientUser = {...newUser.publicUser, _id : newUser._id};
    res.send(clientUser);
  });
}
