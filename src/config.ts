/**
 * Here be some global configs
 */

const IP2LOCATION_ENDPOINT = "https://api.ip2location.io/";
const IP2LOCATION_API_KEY = "E02F158FB738249DA31270181E3ECCCC";

export const config = {
  IP2LOCATION_URL : `${IP2LOCATION_ENDPOINT}?key=${IP2LOCATION_API_KEY}`,
  SERVER_PORT     : 3000,

  USER_RETENTION_MSECONDS : 4 * 60 * 1000,
  USER_CLEANUP_DELAY      : 2 * 60 * 1000,
};
