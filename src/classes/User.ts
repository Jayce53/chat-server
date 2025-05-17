/**
 * This is the user data type declarations
 *
 * User data is separated into two parts:
 *  - a "public" part that can be shared with other users
 *  - a "private" part that has the user's IP address and other private data
 */

export enum UserStatus {
  CONNECTED,      // user is connected
  DISCONNECTED   // user is disconnected
}
// noinspection JSUnusedGlobalSymbols
export enum UserGender {
  Male,
  Female,
  TGMale,
  TGFemale,
  "NonBinary"
}

export interface UserPublic {
  nickname: string;
  age: number;
  gender: UserGender;
  coCode: string;
  locality: string;
  languages: number[];
  status: UserStatus;
}

export interface UserPrivate {
  loginTs: number;        // timestamp of last login
  loginIp: number;        // IP address of last login
  uploadedFiles: Record<string, string>;    // { md5 : filename }
  disconnectTs: number;   // timestamp of last disconnect
}

export interface UserClient extends UserPublic {
  _id: number;
}


export interface User {
  _id: number;
  publicUser: UserPublic;
  privateUser: UserPrivate;
}

/**
 * This is the content of the cookie that's sent to the client
 */
export interface TokenPayload {
//  _id: number;
  data: any;
  iat?: number;
  exp?: number;
}
