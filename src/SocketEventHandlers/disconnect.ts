import {Socket} from "socket.io";
import {userStore} from "@/classes/UserStore";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";

/**
 * Export the event name so we can recognise unhandled events
 */
export const event:EventNames = EventNames.DISCONNECT;


/**
 * A user has disconnected
 *
 * Mark the user as disconnected and broadcast the fact to the others
 *
 * @param socket
 * @param reason
 */
async function socketDisconnect(socket: Socket, reason: string) {
  console.log(`socket disconnect: ${socket.id} (userId: ${socket.userId}) for reason: ${reason}`);
  const {userId} = socket;
  await userStore.setDisconnected(userId!);
  socket.broadcast.emit(EventNames.USERDISCONNECT, userId);
}

SocketEventHandler.register(EventNames.DISCONNECT, socketDisconnect);
