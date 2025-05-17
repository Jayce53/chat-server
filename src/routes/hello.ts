/**
 * The client has just loaded the front page
 *
 * This request will pass our "token" cookie if it exists on the user's end
 *
 * We can have 3 situations:
 * - the user has a valid token, and it points to an existing, logged-in user
 *    In this case, we'll send the user's data and a logged-in flag to the client
 *
 * - the user has a valid token, and it points to an existing, logged-out user
 * - the user has a valid token, but it points to a user that has been dropped
 *   In this case, we'll send the user's data but no logged-in flag to the client
 *
 * - the user has no token (the token has expired or was never set)
 *   In this case, we'll send blank user data. Gets the user's country from the IP
 *
 */
import {Application, Request, Response} from "express";
import {globals} from "@/global";
import {UserClient, User, UserStatus} from "@/classes/User";
import {getTokenPayload} from "@/token";
import {userStore} from "@/classes/UserStore";

// import {userStore, ip2int} from "@/classes/UserStore";

/**
 *  There may be a "token", which is an encrypted JSON string of the user's basic data
 *
 */

// noinspection JSUnusedGlobalSymbols
export function routeSetup(app : Application) : void {
  console.log("setup route: /api/hello");
  app.post("/api/hello", async (req : Request, res : Response) : Promise<void> => {
    const ip = req.header("X-Real-IP") ?? "0.0.0.0";
    console.log(`------------- hello ip=${ip} --------------`);
    /**
     * user is the user data as the client sees it
     * It is the _id plus the fields in UserPublic
     */
    let user : Partial<UserClient> | undefined;
    let tokenUser : Partial<UserClient> | null = null;
    /**
     * If the user has a token, we'll use it to attempt to get the user's data from the DB
     *
     * If the token is in the body, it's been passed as a query param for testing
     * If it's in a cookie, then it's non-testing
     */
    if (req.body.token) {
      console.log("There is a token in the body (testing)");
      tokenUser = getTokenPayload(req.body.token);
    } else if (req.cookies?.token) {
      console.log("There is a token cookie (returning)");
      tokenUser = getTokenPayload(req.cookies.token);
    } else {
      console.log("NO cookie token or body token");
    }
    /**
     * If the token is valid, we'll use it to try to get the user's data
     * Here the user can be a user returning after a short absence (<= 15 mins)
     * or a user who is returning after a long absence (> 15 mins and <= 7 days)
     *
     * If the user is still on the DB, we'll send the user's data with their actual
     * We'll also update the user's status to "CONNECTED"
     *
     * If the user is not on the DB, we'll send some user's data with a zero id and default data
     */

    // FIXME - make sure the user hasn't changed his data in a way that would make him a different user (name, gender)
    if (tokenUser && tokenUser._id) {
      console.log(`Returning user (${tokenUser._id})`);
      const fullUser : User | undefined = userStore.getUser(tokenUser._id);
      if (fullUser) {
        fullUser.publicUser.status = UserStatus.CONNECTED;
        user = {_id : tokenUser._id, ...fullUser.publicUser};
        console.log(`Returning user is ${user.nickname}`);
      } else {
        console.log("Returning user is no longer on DB");
      }
    }
    /**
     * If there's no user data from the DB, we have either:
     *  - or completely new user or a previous user whose token cookie has expired (and DB data has been dropped)
     *    (or a user who has cleared their cookies)
     *  - a previous user who still has a token but has been dropped from the DB
     *
     *  In the case of a new user, return a user with an _id of -1
     *  For a returning DB expired user, return the database data but with a zero _id
     */
    if (!user) {
      if (!tokenUser) {
        /**
         * This is a completely new user - send back an empty user with an _id of -1
         */
        console.log("This is a completely new user!");
        user = {
          _id    : -1,
          coCode : globals.ipLookup?.(ip)?.country?.names.en ?? ""
          // nickname  : "",
          // age       : 0,
          // gender    : undefined,
          // coCode    : globals.ipLookup?.(ip)?.country?.names.en ?? "",
          // locality  : "",
          // languages : []
        };
      } else {
        /**
         * This is a previous user who has been dropped from the DB
         * Send back the user's data (from the token) but with an _id of 0
         */
        console.log("This is a DB expired previous user");
        user = {...tokenUser, _id : 0};
      }
    }
    res.send(user);
  });
}
