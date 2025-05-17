/**
 * This the event handler for the "li" (login) event
 *
 * LOGIN is sent from the client in response to it receiving a "connect" event
 *
 * That establishes that the client
 * is up, running and connected via socketio
 *
 * We expect that we will get a JWT token in the cookie, or as the message content
 * (The token will be in the cookie normally, or it's in the message content if it's a test)
 *
 * The user should be in the userStore (and on DB) because that's what the /api/login does
 *
 * We store the user's ID in the socket so we know who it is when we get a message from this socket
 * We store the socket in the user's store so we can send messages to the user
 *
 * Also change the user's status to "CONNECTED"
 *
 * We'll also send a "new user" message to all connected users.
 * Note we send the database user object, not the token user object because the database object has the updated status
 */
import {Socket} from "socket.io";
import cookie from "cookie";
import {userStore} from "@/classes/UserStore";
import {getTokenPayload} from "@/token";
import {UserClient, UserStatus} from "@/classes/User";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";

/**
 * Export the event name so we can recognise unhandled events
 */
export const event = EventNames.LOGIN;

// TODO - make sure this is arriving at an appropriate time
// TODO - make sure the user is actually logged in etc

async function loginHandler(socket : Socket, isLoggedIn : boolean, loginToken? : string) {
  console.log(`---------- li event on socket ${socket.id} ----------`);
  if (!socket.handshake?.headers?.cookie && !loginToken) {
    console.log("No cookie or body token");
    // TODO - what now??
    return;
  }
  let token;
  if (socket.handshake.headers.cookie) {
    console.log("Has cookie token");
    token = cookie.parse(socket.handshake.headers.cookie).token;
    if (!token) {
      console.log("No value for token cookie");
      // TODO - what now??
      return;
    }
  } else {
    console.log("Has token in message data");
    token = loginToken;
  }
  const payloadUser : UserClient | null = getTokenPayload(token!);
  if (!payloadUser || payloadUser._id <= 0) {
    console.log("Token decode error");
    // TODO - what now??
    return;
  }
  const userData = userStore.getUser(payloadUser._id);

  if (userData) {
    // TODO - do some checks here??
    console.log(`Found user from token id: ${payloadUser._id} ${userData.publicUser.nickname}`);
  } else {
    // TODO - log this error
    // TODO - send an error message to the client
    console.log(`No user found for id from token: ${payloadUser._id}`);
    return;
  }

  const user : UserClient = {...userData.publicUser, _id : payloadUser._id};
  /**
   * Store the user's ID in the socket so we know who it is when we get a message from this socket
   */
  socket.userId = payloadUser._id;
//  console.log(`Set socket.userId: socket.id: ${socket.id} socketUserId: ${socket.userId}`);
  userStore.setSocket(payloadUser._id, socket);
  await userStore.setStatus(payloadUser._id, UserStatus.CONNECTED);
  /**
   * Tell the user about all the other users
   */
  const allUsers = userStore.getAllUsers();
  socket.emit(EventNames.USERLIST, allUsers);
  socket.broadcast.emit(EventNames.NEWUSER, [{...user, status : UserStatus.CONNECTED}]);
}

SocketEventHandler.register(EventNames.LOGIN, loginHandler);
