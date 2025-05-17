/**
 * Sets up and configures the socket.io server with CORS and session handling
 *
 * Also sets up the WebSocketEventManager so wsevent handlers can hook themselves into the socket events
 */
import {Server as SocketIOServer, ServerOptions} from "socket.io";
import {Server} from "http";
import {importHandlers} from "@/importhandlers";
import {SocketEventHandler} from "@/classes/SocketEventHandler";

console.log("WebSocketServer.ts");

let io : SocketIOServer;

const handledEvents : string[] = await importHandlers();
console.log("handledEvents: ", handledEvents);
// FIXME only allows cors in development
const initializeWebSocketServer = async (httpServer : Server) => {
  console.log("initializeWebSocketServer");

  const socketServerOptions : Partial<ServerOptions> = {
    path         : "/ws/",
    cors         : {
      origin      : (origin : string | undefined, callback : (err : Error | null, allow? : boolean | string) => void) => {
        callback(null, origin);
      },
      credentials : true
    },
    pingInterval : 10000,
    pingTimeout  : 120000
  };

  io = new SocketIOServer(httpServer, socketServerOptions);

  io.on("new_namespace", (namespace) => {
    console.log("new_namespace: ", namespace.name);
  });

  io.on("connect", async (socket) => {
    console.log(`---------- New io connection: ${socket.id} ----------`);

    console.log(`cookie: ${socket.handshake?.headers?.cookie}`);
    SocketEventHandler.setup(socket);

    socket.onAny((event, ..._args) => {
      console.log(`ws onAny: ${event} `);
      if (!handledEvents.includes(event)) {
        throw new Error(`Unhandled event: ${event}`);
      }
    });
  });

  return io;
};

export {initializeWebSocketServer};
