import * as fs from "fs";
import {createLogger, transports, format} from "winston";

// Create a log directory if it doesn't exist
const logDir = "./logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define the transports for Winston
const loggerTransports = [
  new transports.File({filename : "./logs/app.log"}),
];

// Create a logger instance
const logger = createLogger({
  format     : format.simple(),
  transports : loggerTransports,
});

// Replace console.log() with the custom logger
console.log = (...args: any[]) => {
  logger.info(args.join(" "));
};
