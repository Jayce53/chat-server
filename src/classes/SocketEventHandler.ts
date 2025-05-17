/**
 * This is a class for event handlers
 *
 * It's completely static otherwise we'd need one instance per event per socket
 *
 * This class keeps a map of handlers keyed on event name
 *
 * All the event handlers in the /src/SocketEventHandlers directory are dynamically imported
 * Each of those modules exports an event name and a handler function
 *
 * These are passed to SocketEventHandler.register and stored in the map
 *
 * As each socket connects, the event handlers are set up on the socket
 *
 */
import type {Socket} from "socket.io";
import {EventNames} from "@/eventnames";

type EventHandler = (socket: Socket, ...args: any[]) => void;

const eventHandlers = {} as Record<EventNames, EventHandler>;
// fixme  Check that the socket has a userId

export class SocketEventHandler {
  static register(event: EventNames, handler: EventHandler) {
    console.log(`Registering event handler for ${event}`);
    eventHandlers[event] = handler;
  }

  static setup(socket: Socket) {
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      console.log(`Setting up event handler for ${event}`);
      socket.on(event, (...args: any[]) => {
        handler(socket, ...args);
      });
    });
  }
}
