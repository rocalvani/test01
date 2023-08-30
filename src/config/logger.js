import winston from "winston";
import config from "./config.js";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "magenta",
    warning: "yellow",
    info: "green",
    http: "blue",
    debug: "white",
  },
};


const devLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
    // new winston.transports.File(
    //     {
    //         filename: './errors/errors.log',
    //         level: 'warning', //Cambiamos el logger level name.
    //         format: winston.format.simple()
    //     }
    // )
  ],
});

//Creating our logger:
const prodLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./errors/errors.log",
      level: 'error',
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A'
        }),
        winston.format.align(),
        winston.format.printf((info)=> `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    }),
  ],
});

//Declare a middleware:
const addLogger = (req, res, next) => {
  if (config.environment === "prod") {
    req.logger = prodLogger;
  } else {
    req.logger = devLogger;
  }
  // req.logger.info(`${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
  next();
};

export default addLogger;
