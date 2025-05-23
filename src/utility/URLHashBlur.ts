/**
 * This is the TS version of URLHashBlur.php
 *
 * URLHash obfuscates the part of a URL that would normally have two ID's into a 12 (or 13) character hash
 * e.g. photo URLs that need to know a memberID and a photo ID
 *
 * Will only work for numbers < 10,000,000  (i.e. 7 digits max)
 *
 * It also decodes a hash into its constituent IDs
 *
 * There is a "blur" option that will encode whether the URL is refers to a blurred or non-blurred "image" (or whatever)
 * The meaning of "blurred" is entirely up to the caller. "Blurrable" hashes are 13 characters not 12
 *
 * Encoding:
 *
 * A 14 character string is generated by concatenating the zero filled ID's.  The the last digit of the ID that changes most frequently is used
 * as an offset to split the string into two parts which are swapped and recombined. Then the string is split into two 7 character
 * substrings and a 12 character hex string is created by concatenating the hex values of the 7 character (decimal) substring. To decode, just reverse :)
 *
 * For example, assume a photo URL for member ID 12345 and photo ID 67896. The photo ID is the one that changes most frequently since it is the
 * only thing that will change for each photo for a given member.
 *
 * A 14 character string is created by concatenating the frequently changing key to the other:
 *   00123450067896
 *
 * The last digit is used as an offset to split the string. So take the last digit (6) and split the string into the first 6 characters and the rest (not including the 6)
 * 001234 and 5006789
 *
 * These are then swapped and the offset character added again at the end:
 * 50067890012346
 *
 * This is then split into two 7 character strings:
 *
 * 5006789 and 0012346
 *
 * A these are then converted to 6 character hex strings and concatenated to get the final obfuscated hash:
 *
 * 4c65c5 + 00303a => "4c65c500303a"
 *
 * The next photo for that member (phID = 67897)  would produce:
 * 00123450067897
 * 0012345 006789
 * 00678900123457
 * 0067890 0123457
 * 010932 01e241 => "01093201e241"  which is seemingly totally unrelated to the previous one
 *
 * Blurrable Encoding
 *
 * This is the same as the basic stuff, except a "blur digit" (a single hex digit) is added between the resultant two 6 character hex strings
 * The number of places to rotate is also increased by one if it's to be blurred so the blurred/unblurred hash's for the same IDs look totally different
 *
 * There can be 16 possible blur flags (0-15).  The meaning of each value is entirely up to the caller, all we do is encode a value and return it on decode
 *
 * The blur digit is (ID % 25 + blurFlag) % 16
 * where ID is the most frequently changing ID and blurFlag is a value between 0 and 15
 *
 * To decode it it's just (blurDigit - (ID % 16)) (+ 16 if the result is negative)
 *
 */

// import {padNum} from "@/utils/padnum";

const NOTBLURRABLE = -1;

function padNum(num: number, len: number, fill: string = "0"): string {
  return num.toString().padStart(len, fill);
}

function pad(num: number | string, len: number, fill: string = "0"): string {
  return num.toString().padStart(len, fill);
}

/**
 * Encode two ID's to produce an obfuscated hash string
 *
 * @param ID0 integer The first ID.
 * @param ID1 integer The second ID. This is the ID that changes most frequently
 * @param blurFlag integer If NOTBLURRABLE, the hash is non blurrable and 12 characters. Otherwise the hash is 13 characters and the blur flag is encoded in
 *            the hash
 * @return string The obfuscated hash
 */
function encode(ID0: number, ID1: number, blurFlag: number = NOTBLURRABLE): string {
  const s = `${padNum(ID0, 7)}${padNum(ID1, 7)}`;
  /**
   * Get the last digit of the second ID and use it as an offset to split the string into two parts
   */
  let rotate: number = ID1 % 10;

  /**
   * Handle non blurable hash's first
   */
  if (blurFlag === NOTBLURRABLE) {
    const str = s.substring(rotate, 13) + s.substring(0, rotate) + rotate;
    return `${pad(parseInt(str.substring(0, 7), 10).toString(16), 6)}${pad(parseInt(str.substring(7), 10).toString(16), 6)}`;
    // $str = substr($s, $rotate, 13 - $rotate) . substr($s, 0, $rotate) . $rotate;
    // printf("bd: rot: $rotate 12char: %06x%06x 14: %s\n", (int) substr($str, 0, 7), (int) substr($str, 7, 7), $str);
    // return sprintf("%06x%06x", (int) substr($str, 0, 7), (int)substr($str, 7, 7);
  }

  const lastDigit: string = rotate.toString();
  const blurDigit = ((ID1 % 25) + blurFlag) % 16;
  rotate += (blurDigit % 4);
  let str = s.substring(rotate, 13) + s.substring(0, rotate) + lastDigit;
  str = `${pad(parseInt(str.substring(0, 7), 10).toString(16), 6)}${pad(parseInt(str.substring(7), 10).toString(16), 6)}`;
  let t: number = (blurDigit % 10) + 1;
  str = str[0] + str.substring(t + 1, 11) + str.substring(1, t + 1) + str[11];
  t = ((str[0].charCodeAt(0) + str[11].charCodeAt(0)) % 10) + 1;
  return str[0] + str.substring(t, 11) + blurDigit.toString(16) + str.substring(1, t) + str[11];
}

/**
 * Decodes a hash and returns the IDs in an array.
 * Works by reversing encode :)
 *  ID0 = mbID, ID1 = phID
 *
 * @param urlHash string The obfuscated url hash
 * @return object The IDs. $result->ID0,$result->ID1, $result->blurFlag
 */

function decode(urlHash: string) : {ID0: number, ID1: number, blurFlag: number} {
  const result = {
    ID0      : 0,
    ID1      : 0,
    blurFlag : 0,
  };
  let blurDigit: boolean | number;
  let s: string;
  let lastDigit: string;
  let rotate: number;
  let str = "";

  if (urlHash.length === 12) {
    blurDigit = false;
    s = `${pad(Number(`0x${urlHash.substring(0, 6)}`), 7)}${pad(Number(`0x${urlHash.substring(6)}`), 7)}`;
    lastDigit = s.substring(13);
    rotate = Number(lastDigit);
  } else {
    let t: number = ((urlHash.charCodeAt(0) + urlHash.charCodeAt(12)) % 10) + 1;
    blurDigit = Number(`0x${urlHash.substring(12 - t, 12 - t + 1)}`);
    str = `${urlHash[0]}${urlHash.substring(13 - t, 13 - t + t - 1)}${urlHash.substring(1, 1 + 11 - t)}${urlHash[12]}`;
    t = (blurDigit % 10) + 1;
    str = `${str[0]}${str.substring(11 - t, 11)}${str.substring(1, 11 - t)}${str[11]}`;
    s = `${pad(Number(`0x${str.substring(0, 6)}`), 7)}${pad(Number(`0x${str.substring(6)}`), 7)}`;
    lastDigit = s.substring(13);
    rotate = Number(lastDigit);
    rotate += blurDigit % 4;
  }
  str = s.substring(13 - rotate, 13) + s.substring(0, 13 - rotate) + lastDigit;
  result.ID0 = Number(str.substring(0, 7));
  result.ID1 = Number(str.substring(7));
  if (blurDigit !== false) {
    result.blurFlag = (blurDigit - (result.ID1 % 25)) % 16;
    result.blurFlag += (result.blurFlag < 0) ? 16 : 0;
  } else {
    result.blurFlag = 0;
  }
  return result;
}
// noinspection JSUnusedGlobalSymbols
export default {encode, decode};
