import { createLogger, format, transports } from "winston";
import path from "path";
import config from "../config/config";
import Utils from "./Utils";

const { combine } = format;
const LoggerLevel = {
  error: "error",
  warn: "warn",
  info: "info",
  verbose: "verbose",
  debug: "debug",
  silly: "silly"
};
const PROD_LOG_LEVEL = LoggerLevel.debug;
const DEV_LOG_LEVEL = LoggerLevel.debug;

const Logger = createLogger({
  format: combine(
    format.colorize(),
    format.splat(),
    format.simple(),
    format.timestamp()
  ),
  transports: [
    new transports.Console({
      level: config.isDevModeEnabled ? DEV_LOG_LEVEL : PROD_LOG_LEVEL
    }),
    new transports.File({
      filename: path.join(
        __dirname,
        `../../logs/debug/debug_${Utils.generateCurrentDateFileName()}.log`
      ),
      level: LoggerLevel.debug
    }),
    new transports.File({
      filename: path.join(
        __dirname,
        `../../logs/error/debug_${Utils.generateCurrentDateFileName()}.log`
      ),
      level: LoggerLevel.error
    })
  ]
});

if (config.isDevModeEnabled) {
  Logger.info("Application initialized in development mode");
} else {
  Logger.info("Application initialized in production mode");
}
export default Logger;
