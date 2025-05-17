import {Socket} from "socket.io";
import {userStore} from "@/classes/UserStore";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";

/**
 * Export the event name so we can recognise unhandled events
 */
export const event = EventNames.LOGOUT;

/**
 * A user has explicitly logged out
 *
 * We need to delete all his user data and broadcast the fact to the other users
 *
 * @param socket
 */
async function userLogout(socket: Socket) {
  console.log(`User (${socket.userId}) logged out: ${socket.id}`);
  const {userId} = socket;
  await userStore.logout(userId!);
  socket.broadcast.emit(EventNames.LOGOUT, userId);
}

SocketEventHandler.register(EventNames.LOGOUT, userLogout);
