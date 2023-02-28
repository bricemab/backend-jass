import express, {Request, Response} from "express";
import Logger from "./utils/Logger";
import Utils from "./utils/Utils";
import path from "path";
import morgan from "morgan";
import fs from "fs";
import fileUpload from "express-fileupload";
import { createPool } from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import GlobalStore from "./utils/GlobalStore";
import config from "./config/config";
import {DatabaseSettings} from "./Global/DatabaseType";
import {GeneralErrors} from "./Global/BackendErrors";
import UsersRouter from "./routes/UsersRouter";
import TokenManager from "./Global/TokenManager";
import WsManager from "./services/Ws/WsManager";

const app = express();
const setup = async () => {
  Logger.verbose(`Setup started`);
  app.use(
    morgan("combined", {
      stream: fs.createWriteStream(
        path.join(
          __dirname,
          `../logs/http/access_${Utils.generateCurrentDateFileName()}.log`
        ),
        {
          flags: "a"
        }
      )
    })
  );

  app.use(compression());
  app.use(fileUpload());
  app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
  app.use(bodyParser.json({limit: "50mb"}));
  app.use(cors({
    origin: (origin, callback) => {
      const whitelist = [
        "https://jass.brice-mabillard.ch",
        "https://rest.brice-mabillard.ch",
        "https://ws.brice-mabillard.ch"
      ]
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }));
  app.set("trust proxy", 1); // trust first proxy
  app.use(TokenManager.buildSessionToken)

  const pool = createPool({
    host: config.database.host,
    user: config.database.user,
    database: config.database.database,
    password: config.database.password,
    waitForConnections: true,
    namedPlaceholders: true,
    connectionLimit: 20,
    queueLimit: 0
  });

  function keepAlive() {
    pool.getConnection((err, connection) => {
      if (err) {
        return;
      }
      connection.query("SELECT 1", (error, rows) => {
        connection.end();
        if (error) {
          console.log(`QUERY ERROR: ${error}`);
        }
      });
    });
  }

  setInterval(keepAlive, 1000 * 60 * 60);
  const promisePool = await pool.promise();
  GlobalStore.addItem("dbConnection", promisePool);

  const dbSettings = Utils.castMysqlRecordsToArray<DatabaseSettings>(
    await Utils.getMysqlPool().execute(
      "SELECT * FROM settings"
    )
  );
  console.log(dbSettings)
  GlobalStore.addItem("dbSettings", dbSettings)
  const ws = new WsManager();
  GlobalStore.addItem("ws", ws);
}
setup()
  .then(() => {
    Logger.verbose(`Setup finish with success`);

    app.use("/users", UsersRouter);
    app.get("*", (req: Request, res: Response) => {
      res.json({state: "Page dont exist"});
    });

    Logger.verbose(`Server starting`);
    app.listen(config.server.port, "0.0.0.0", () => {
      const protocol = config.isDevModeEnabled ? "http" : "http";
      Logger.info(
        `Jass BACKEND is now running on ${protocol}://${config.server.hostName}:${config.server.port}`
      );
    });

    app.on("error", (error: any) => {
      console.log(error)
      Utils.manageError({
        code: GeneralErrors.UNHANDLED_ERROR,
        message: `Error occurred in express: ${error}`
      });
    });
  })
  .catch(error => {
    Logger.warn(`Setup finish with errors`);
    console.log(error)
  });
