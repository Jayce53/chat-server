// WebSocketEventManager.ts
import {Socket} from "socket.io";

type WebSocketEventListener = (socket: Socket, ...args: any[]) => void;

export class WebSocketEventManager {
  private readonly eventHandlers: Record<string, WebSocketEventListener>;

  constructor() {
    this.eventHandlers = {};
  }

  on(event: string, handler: WebSocketEventListener): void {
    this.eventHandlers[event] = handler;
  }

  trigger(event: string, socket: Socket, ...args: any[]): void {
    const eventHandler: WebSocketEventListener = this.eventHandlers[event];
    if (eventHandler) {
      eventHandler(socket, ...args);
    } else {
      console.error(`No handler registered for event: ${event}`);
      // Additional error handling as needed
    }
  }
}
