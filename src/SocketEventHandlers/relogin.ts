import {Socket} from "socket.io";
import {userStore} from "@/classes/UserStore";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";
import {UserStatus} from "@/classes/User";
import {Conversation, type WSConversation} from "@/classes/Conversation";

// FIXME - isnt this almost exactly the same as the login handler?
/**
 * Export the event name so we can recognise unhandled events
 */
export const event = EventNames.RELOGIN;

/**
 * An existing logged in user has re-connected
 *
 * Mark the user as logged in and broadcast  and broadcast the fact to the others
 *
 * @param socket
 * @param _id
 */
async function reloginHandler(socket : Socket, _id : number) {
  console.log(`---------- relogin event on socket ${socket.id} user: ${_id}----------`);

//  console.log("cookie: ", socket.handshake?.headers?.cookie);

  const user = userStore.getUser(_id);
  /**
   * FIXME - don't crash
   *
   * This can happen if the server restarts and the user was still logged in but the DB record was deleted?
   */
  if (!user) {
    throw new Error(`No user found for id: ${_id}`); // FIXME!! Can happen if a test user client closes the window, gets deleted and reselected in testlogin
  }

  socket.userId = _id;
  userStore.setSocket(_id, socket);
  await userStore.setStatus(_id, UserStatus.CONNECTED);
  /**
   * Tell the user about all the other users
   */
  const allUsers = userStore.getAllUsers();
  socket.emit(EventNames.USERLIST, allUsers);

  // FIXME Need to send back the user's conversations
  const conversations : WSConversation[] = Conversation.getAllByUserId(socket.userId);
  socket.emit(EventNames.CONVERSATIONS, conversations);

  // FIXME Should be broadcasting a RELOGIN message to all connected users not NEWUSER
  socket.broadcast.emit(EventNames.NEWUSER, [{...user?.publicUser, _id : user?._id, status : UserStatus.CONNECTED}]);
}

SocketEventHandler.register(EventNames.RELOGIN, reloginHandler);
