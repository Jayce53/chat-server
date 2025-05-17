/**
 * This is the in-memory store of users
 *
 * It also handles the database interactions when changes are made to the in-memory store
 *
 * User data is stored in two parts:
 *  - a "public" part that is shared with other users
 *  - a "private" part that has the user's IP address and other private data
 */
import {InsertOneResult} from "mongodb";
import {Socket} from "socket.io";
import {User, UserClient, UserStatus} from "@/classes/User";
import {db} from "@/classes/Database";
import {config} from "@/config";
import {getIO} from "@/store";
import {EventNames} from "@/eventnames";

export class UserStore {
  /**
   * User data keyed on _id
   * @type {Map<number, User>}
   * @private
   */
  private users : Map<number, User> = new Map<number, User>();

  /**
   * Socket data keyed on user._id
   * @type {Map<number, Socket>}
   * @private
   */
  private sockets : Map<number, Socket> = new Map<number, Socket>();

  /**
   * Inserts a new user into the store and the database
   *
   * It splits the incomong user data into public and private parts and stores them separately
   *
   * This is so we can retrieve the entire base of public data and send to new users without
   * having to strip the private data every time we want to send a user list to a new user
   *
   * @param user
   * @param socket
   */
  public async insert(user : User, socket : Socket = null as unknown as Socket) : Promise<InsertOneResult | undefined> {
    /**
     * This should never happen, but just in case...
     * TODO - log the error
     */
    if (this.users.has(user._id)) {
      return undefined;
    }

    this.users.set(user._id, user);
    this.sockets.set(user._id, socket);
    return db.insertOne("user", user);
  }

  public setSocket(userId : number, socket : Socket) : void {
    this.sockets.set(userId, socket);
  }

  public getUploadedFileName(userId : number, md5 : string) : string | undefined {
    const user = this.getUser(userId);
    if (!user) {
      return undefined;
    }
    return user.privateUser.uploadedFiles[md5];
  }

  /**
   * Load the existing users from the database into the memory store
   * @param users
   */
  public load(users : User[]) : void {
    users.forEach((user : User) => {
      this.users.set(user._id, user);
    });
  }

  /**
   * Get the data for a user
   * Or undefined if the user doesn't exist
   *
   * @param userId
   */
  public getUser(userId : number) : User | undefined {
    if (!this.users.has(userId)) {
      return undefined;
    }
    return this.users.get(userId);
  }

  /**
   * Get the socket for the user
   * @param userId
   */
  public getSocket(userId : number) : Socket | undefined {
    if (!this.sockets.has(userId)) {
      return undefined;
    }
    return this.sockets.get(userId);
  }

  /**
   * Get the public data for all users that the client is allowed to see
   * The sequence of the users is not significant
   * because each client will sort the users by country, _id etc
   */
  public getAllUsers() : UserClient[] {
    return Array.from(this.users).map(([id, user] : [number, User]) => {
      return {_id : id, ...user.publicUser};
    });
  }

  // public getDisconnectedUsers() : User[] {
  //   const cutoff = Math.floor(Date.now() / 1000) - config.USER_RETENTION_MSECONDS;
  //   return Array.from(this.users.values()).filter((user : User) => {
  //     return user.publicUser.status === UserStatus.DISCONNECTED && user.privateUser.disconnectTs < cutoff;
  //   });
  // }

  /**
   * Get the number of users in the store
   */
  public getUserCount() : number {
    return this.users.size;
  }

  /**
   * A user has explicitly logged out.  We assume that he won't be back anytime soon
   * So we'll delete all his user data.
   * The next time he logs in, he'll be treated as a returning user (without any history) IF he still has the token cookie
   * If the token cookie has expired or has been deleted, he'll be treated as a completely new user
   * @param userId
   */
  public logout(userId : number) : Promise<any> {
    /**
     * Delete internal user data
     */
    this.users.delete(userId);
    this.sockets.delete(userId);
    /**
     * Delete user data from the database
     */
    return Promise.all([
      db.deleteMany("conversation", {participants : userId}),
      db.deleteOne("user", {_id : userId}),
    ]);
  }

  public startExpiredMonitor() {
    setInterval(this.removeExpired.bind(this), config.USER_CLEANUP_DELAY);
  }

  /**
   * This will get called every config.USER_CLEANUP_DELAY msecs
   * It gets an array of IDs of expired users and deletes them from the users map and the DB
   * Then broadcasts the expired users array to all connected clients
   * @returns {Promise<any>}
   */
  public async removeExpired() : Promise<any> {
    const cutoff = Date.now() - config.USER_RETENTION_MSECONDS;
    const expired : number[] = [];

    /**
     * Find the users who are disconnected over config.USER_RETENTION_MSECONDS ago
     */
    this.users.forEach((user : User) => {
      if (user.publicUser.status === UserStatus.DISCONNECTED
        && user.privateUser.disconnectTs > 0
        && user.privateUser.disconnectTs < cutoff
      ) {
        expired.push(user._id);
        this.users.delete(user._id);
      }
    });
    if (expired.length > 0) {
      console.log(`removing ${expired.length} expired ${expired}`);
    }
    /**
     * Tell everybody that these users are expired
     * IF there are expired users, else don't bother
     */
    if (expired.length > 0) {
      /**
       * io.emit() will broadcast the array to all connected clients
       */
      getIO().emit(EventNames.EXPIREUSERS, expired);
      /**
       * Delete them as a batch from the DB
       */
      await db.deleteMany("user", {_id : {$in : expired}});

      return Promise.resolve(expired);
    }
    return Promise.resolve(undefined);
  }

  /**
   * Set the status of a user to disconnected
   * This isn't the same as "logout". We're assuming that the user has lost his connection
   * and is likely to re-connect within a few minutes
   * @param userId
   */
  public setDisconnected(userId : number) : Promise<any> {
    const user = this.getUser(userId);
    if (user) {
      const now = Date.now();
      user.publicUser.status = UserStatus.DISCONNECTED;
      user.privateUser.disconnectTs = now;
      return db.updateOne("user", {_id : userId}, {$set : {"publicUser.status" : UserStatus.DISCONNECTED, "privateUser.disconnectTs" : now}});
    }
    // FIXME - should never happen
    return Promise.resolve(undefined);
  }

  /**
   * Set the status of a user
   * @param userId
   * @param status
   */
  public setStatus(userId : number, status : UserStatus) : Promise<any> {
    const user = this.getUser(userId);
    // FIXME - what if the user doesn't exist??
    if (!user) {
      return Promise.resolve(undefined);
    }
    user.publicUser.status = status;
    return db.updateOne("user", {_id : userId}, {$set : {"publicUser.status" : status}});
  }
}

const userStore : UserStore = new UserStore();

// https://gist.github.com/jppommet/5708697
// noinspection JSUnusedGlobalSymbols
function int2ip(ipInt : number) : string {
  return (`${ipInt >>> 24}.${(ipInt >> 16) & 255}.${(ipInt >> 8) & 255}.${ipInt & 255}`);
}

function ip2int(ip : string) : number {
  return ip.split(".").reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0;
}

export {ip2int, int2ip, userStore};
