/**
 * https://api.ip2location.io/?key=E02F158FB738249DA31270181E3ECCCC&ip=167.179.173.221
 */
import axios, {AxiosError} from "axios";
// @ts-ignore, because when setting node module resolution to esnext, tsc raises an error for the import assertion.
import countries from "@/data/countries.json" assert {type : "json"};
// @ts-ignore, because when setting node module resolution to esnext, tsc raises an error for the import assertion.
import cities from "@/data/cities.json" assert {type : "json"};
// @ts-ignore, because when setting node module resolution to esnext, tsc raises an error for the import assertion.
import states from "@/data/states.json" assert {type : "json"};

import {config} from "@/config";

interface States {
  au: string[];
  ca: string[];
  us: string[];
}

// const apiKey: string = "E02F158FB738249DA31270181E3ECCCC";
// const url: string = `https://api.ip2location.io/?key=${apiKey}&ip=`;

interface ApiResponse {
  country_code: string;
}

export async function getCountry(ip: string) {
  return axios.get<ApiResponse>(`${config.IP2LOCATION_URL}&ip=${ip}`)
    .then((response) => {
      return response.data.country_code.toLowerCase();
    })
    .catch((error: AxiosError) => {
      console.log(error);
      // @ts-ignore
      return error.code;
    })
    .finally(() => {
    });
}

export function getStates(coCode: keyof States): string[] {
  return states[coCode] || [];
}

interface Cities {
  [key: string]: string[];
}

export function getCities(coCode: string): string[] {
  return (<Cities>cities)[coCode] || [];
}

