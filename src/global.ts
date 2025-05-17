import {CityResponse} from "maxmind";

type GetFunction = (input: string) => CityResponse | null;

interface Globals {
  devMode: boolean;
  host: string;
  ipLookup: GetFunction | null;
}

export const globals: Globals = {
  devMode  : false,
  host     : "flirtable.me",
  ipLookup : null
};

