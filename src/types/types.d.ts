// noinspection JSUnusedGlobalSymbols

/**
 * Extra type stuff we need
 */

declare namespace NodeJS {

  // noinspection JSUnusedGlobalSymbols
  interface ProcessEnv {
    TOKEN_SECRET? : string;
  }
}

// noinspection JSUnusedGlobalSymbols
interface Request {
  cookies : {
    [key : string] : string;
    token? : string;
  };
}

import EventNames from "./EventNames";

// noinspection ES6UnusedImports
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import {Socket, BroadcastOperator} from "socket.io";
import  "socket.io";
declare module "socket.io" {
  interface Socket {
    emit(event : EventNames, ...args : any[]) : boolean;
    userId? : number;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface BroadcastOperator<EmitEvents = any, SocketData = any> {
    emit(event : EventNames, ...args : any[]) : boolean;
    // emit<Ev extends keyof EmitEvents>(
    //   event : Ev,
    //   ...args : EmitEvents[Ev] extends (...args : infer P) => any ? P : never
    // ) : boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Server<EmitEvents = any> {
    emit(event : EventNames, ...args : any[]) : boolean;
    // emit<Ev extends keyof EmitEvents>(
    //   event: Ev,
    //   ...args: EmitEvents[Ev] extends (...args: infer P) => any ? P : never
    // ): boolean;
  }
}

import "formidable"; // Import to augment the existing module
declare module "formidable" {
  interface VolatileFile {
    filepath : string;
    newFilename : string;
    originalFilename : string;
    mimetype : string;
    hashAlgorithm? : string;
    createFileWriteStream : () => NodeJS.WritableStream;
    lastModifiedDate : Date | null;
    size : number;
    _writeStream : NodeJS.WritableStream | null;
    hash : any; // Replace `any` if needed
  }
}
