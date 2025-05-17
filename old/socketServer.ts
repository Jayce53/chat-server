import {Server as SocketIOServer, Socket} from "socket.io";
import {Server, IncomingMessage} from "http";
import {sessionMiddleware} from "./HttpServer";

interface CustomIncomingMessage extends IncomingMessage {
  session: any, // Replace with your session's type
}

/**
 * Sets up and configures the Socket.IO server.
 * @param server - The HTTP server to which the Socket.IO server will be attached.
 * @returns The configured Socket.IO server instance.
 */
export function setupSocketServer(server: Server): SocketIOServer {
  const io: SocketIOServer = new SocketIOServer(server, {
    path : "/ws/",
    cors : {
      origin      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
        callback(null, origin);
      },
      credentials : true
    }
  });

  io.engine.use(sessionMiddleware);

  // Event listener for new connections
  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    const {session} = socket.request as CustomIncomingMessage;
    console.log("session: ", session);

    socket.on("msg", (data) => {
      console.log("msg rcvd data: ", data);
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {session} = socket.request as CustomIncomingMessage;
      console.log("session: ", session);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
