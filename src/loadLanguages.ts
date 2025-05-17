import fs from "fs";
import * as process from "process";
// import {db} from "./classes/Database";

let jsonData;
// let result;
// let collection;
// let insertMany;

interface CountryData {
  [key: string]: string;

//  coName: string;
}


jsonData = fs.readFileSync("./data/countries.json", "utf8");
const countryData: CountryData = JSON.parse(jsonData);

interface LanguageDataRaw {
  cca2: string;
  languages: {
    [key: string]: string;
  };
}

interface Languages {
  [key: string]: string;
}

interface LanguageData {
  [key: string]: Languages;
}

/**
 * Read the languages data by country
 * We'll have an array of objects - one for each country
 *
 *   {
 *     "cca2"      : "CY",
 *     "languages" : {
 *       "ell" : "Greek",
 *       "tur" : "Turkish"
 *     }
 *   },
 */

jsonData = fs.readFileSync("./data/languages.json", "utf8");
const languageDataRaw: LanguageDataRaw[] = JSON.parse(jsonData);

/**
 * Convert languageDataRaw array of objects to a single object keyed by country code
 */
const languageData: LanguageData = {} as LanguageData;
languageDataRaw.forEach((item) => {
  languageData[item.cca2.toLowerCase()] = item.languages;
});


const allLanguages: {[key: string]: string} = {};

Object.keys(languageData).forEach((coCode) => {
  Object.keys(languageData[coCode]).forEach((langCode) => {
    if (!allLanguages[langCode]) {
      allLanguages[langCode] = languageData[coCode][langCode];
    }
  });
});

const languages = Object.keys(allLanguages).map((langCode) => {
  return allLanguages[langCode];
});

languages.sort();

console.log(languages);

const languagesMap: Map<string, number> = new Map();

const newLanguages: {[key: string]: string[]} = {};

languages.forEach((lang, index) => {
  languagesMap.set(lang, index);
});

Object.keys(languageData).forEach((coCode) => {
  Object.values(languageData[coCode]).forEach((langName) => {
    if (!languagesMap.has(langName)) {
      console.log(`No code for : ${langName}`);
    } else {
      // const lang = languagesMap.get(langName)!;
      // if (!newLanguages[coCode]) {
      //   newLanguages[coCode] = [lang];
      // } else {
      //   newLanguages[coCode].push(lang);
      // }
      if (!newLanguages[coCode]) {
        newLanguages[coCode] = [langName];
      } else {
        newLanguages[coCode].push(langName);
      }
    }
  });
});

/**
 * Update the database with the users' languages
 */
// await db.connect();
//
// // eslint-disable-next-line no-restricted-syntax
// for (const countryCode in newLanguages) {
//   if (Object.prototype.hasOwnProperty.call(newLanguages, countryCode)) {
//     const coLanguages = newLanguages[countryCode];
//
//     // eslint-disable-next-line no-await-in-loop
//     const ret = await db.updateOne("locality", {_id : countryCode}, {$set : {languages : coLanguages}});
//
//     console.log(`Updated "${countryCode}"`, ret);
//   }
// }

/**
 *  Get all the countries for which we have languages but nothing in the countries file
 */
Object.keys(languageData).forEach((coCode) => {
  // const country = countryData[coCode];
  // if (country) {
  //   console.log(`Country: ${coCode} ${country}`);
  // } else {
  if (!countryData[coCode]) {
    console.log(`No country for ${coCode}`);
  }
  // }
});

/**
 * Get all the countries that don't have languages
 */
Object.keys(countryData).forEach((coCode) => {
  const country = countryData[coCode];

  if (languageData[coCode]) {
    // console.log(`Country: ${country}`);
    // console.log("Languages: ", languages);
  } else {
    console.log(`No languages for ${country} (${coCode})`);
  }
});

process.exit(0);
