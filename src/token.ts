/**
 * Handles stuff relating to the user details JWT token
 *
 * Note that the secret is not base64 encoded. It won't be verified by online JWT tools
 * because they expect the secret to be base64 encoded:
 * https://github.com/auth0/node-jsonwebtoken/issues/208#issuecomment-231861138
 */
import jwt from "jsonwebtoken";
import {TokenPayload, UserClient} from "@/classes/User";

/**
 * The TOKEN_SECRET environment variable is set in the docker-compose file
 */


/**
 * We are passed the user's data, and we'll generate a token from it
 * We'll encrypt the user's data and put it in a JWT token
 */
function generateToken(userData : UserClient) : string {
  const tokenPayload : TokenPayload = {
    // iat  : Date.now(),   // iat and exp are set by jwt.sign()
    // exp  : Date.now() + 7 * 24 * 60 * 60 * 1000,
//    _id  : userData._id,
    data : userData
  };
  return jwt.sign(tokenPayload, process.env.TOKEN_SECRET!, {expiresIn : "7d"});
}

/**
 * Decode the JWT token
 * @param {string} token The incoming token
 * @returns {UserClient | null} Return a UserClient if the token is valid, else null
 */
function getTokenPayload(token : string) : UserClient | null {
  let tokenPayload : TokenPayload = {} as TokenPayload;
  try {
    tokenPayload = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenPayload;
  } catch (e) {
    console.error("Error decoding token: ", e);
    // FIXME - At least log it!!
    // TODO what if there's error?
    return null;
  }
  return tokenPayload.data as UserClient;
}

export {generateToken, getTokenPayload};
