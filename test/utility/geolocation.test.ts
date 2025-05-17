// import axios from "axios";
// import {getCountry, getCities, getStates} from "@/utility/geolocation";
// import {config} from "@/config";
//
// jest.mock("axios");
// const mockedAxios = axios as jest.Mocked<typeof axios>;
//
// describe("geolocation tests", () => {
//   test("getCountry: normal", () => {
//     mockedAxios.get.mockResolvedValue({
//       data : {
//         country_code : "US"
//       }
//     });
//     expect(getCountry("1.1.1.1")).resolves.toBe("us");
//     expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     expect(mockedAxios.get).toHaveBeenCalledWith(`${config.IP2LOCATION_URL}&ip=1.1.1.1`);
//   });
//
//   test("getCountry: rejected", () => {
//     mockedAxios.get.mockRejectedValue({
//       code : -1
//     });
//     expect(getCountry("1.1.1.1")).resolves.toBe(-1);
//   });
//
//   const expectedCities = ["Isangel", "Lakatoro", "Luganville", "Norsup", "Port-Olry", "Port-Vila", "Sola"];
//   test("getCities normal", () => {
//     expect(getCities("vu")).toStrictEqual(expectedCities);
//   });
//
//   test("getCities bad country", () => {
//     expect(getCities("xx")).toStrictEqual([]);
//   });
//
//   const expectedStates = ["ACT", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"];
//   test("getStates normal", () => {
//     expect(getStates("au")).toStrictEqual(expectedStates);
//   });
//
//   test("getStates bad country", () => {
//     expect(getStates("" as "au")).toStrictEqual([]);
//   });
// });
