import {Socket} from "socket.io";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";

/**
 * Export the event name so we can recognise unhandled events
 */
export const event = EventNames.CONNECT;

function socketConnect(socket: Socket) {
  console.log(`New socket connect: ${socket.id}`);
}

SocketEventHandler.register(EventNames.CONNECT, socketConnect);
