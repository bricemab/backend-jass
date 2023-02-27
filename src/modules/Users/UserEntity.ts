import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import moment, {Moment} from "moment";
import bcrypt from "bcrypt";
import { DatabaseUser } from "../../Global/DatabaseType";
import {GeneralErrors} from "../../Global/BackendErrors";
import Utils from "../../utils/Utils";
import UsersManager from "./UsersManager";
import config from "../../config/config";

export default class UserEntity extends MysqlAbstractEntity<boolean> {
  public id: number;
  public pseudo: string;
  public email: string;
  public password: string;
  public registrationDate: Moment;
  public lastConnexionDate: Moment;
  public wsToken: string;
  public isAdmin: boolean
  public isArchived: boolean

  constructor(id: number, pseudo: string, email: string, password: string, registrationDate: Moment, lastConnexionDate: Moment, wsToken: string, isAdmin: boolean, isArchived: boolean) {
    super();
    this.id = id;
    this.pseudo = pseudo;
    this.email = email;
    this.password = password;
    this.registrationDate = registrationDate;
    this.lastConnexionDate = lastConnexionDate;
    this.wsToken = wsToken;
    this.isAdmin = isAdmin;
    this.isArchived = isArchived;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `users` (`pseudo`, `email`, `password`, `registration_date`, `last_connexion_date`, `ws_token`, `is_admin`, `is_archived`) VALUES (:pseudo, :email, :password, :registrationDate, :lastConnexionDate, :wsToken, :isAdmin, :isArchived)",
            {
              pseudo: this.pseudo,
              email: this.email,
              password: this.password,
              registrationDate: this.registrationDate.format("YYYY-MM-DD HH:mm:ss"),
              lastConnexionDate: this.lastConnexionDate.format("YYYY-MM-DD HH:mm:ss"),
              wsToken: this.wsToken,
              isAdmin: this.isAdmin,
              isArchived: this.isArchived,
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `users` SET `pseudo`= :pseudo, `email`= :email, `password`= :password, `registration_date`= :registrationDate, `last_connexion_date`= :lastConnexionDate, `ws_token`=:wsToken, `is_admin` = :isAdmin, `is_archived` = :isArchived WHERE `id`= :id",
            {
              pseudo: this.pseudo,
              email: this.email,
              password: this.password,
              registrationDate: this.registrationDate.format("YYYY-MM-DD HH:mm:ss"),
              lastConnexionDate: this.lastConnexionDate.format("YYYY-MM-DD HH:mm:ss"),
              wsToken: this.wsToken,
              isAdmin: this.isAdmin,
              isArchived: this.isArchived,
              id: this.id
            }
          )
        );
      }
      if (responseData.affectedRows === 0) {
        return {
          success: false,
          error: {
            code: GeneralErrors.DATABASE_REQUEST_ERROR,
            message: "The user has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          user: this
        }
      };
    } catch (e) {
      Utils.manageError(e);
      return {
        success: false,
        error: {
          code: GeneralErrors.DATABASE_REQUEST_ERROR,
          message: "An error has occurred while saving data"
        }
      };
    }
  }

  async validatePassword(password: string) {
    if (password && this.password) {
      return bcrypt.compare(password, this.password as string);
    }
    return false;
  }

  async setPasswordEncrypt(password: string) {
    this.password = await bcrypt.hash(
      password,
      config.server.saltRounds
    );
  }

  static fromDatabaseObject(databaseObject: DatabaseUser): UserEntity {
    const user = new UserEntity(
      databaseObject.id,
      databaseObject.pseudo,
      databaseObject.email,
      databaseObject.password,
      moment(databaseObject.registration_date),
      moment(databaseObject.last_connexion_date),
      databaseObject.ws_token,
      databaseObject.is_admin,
      databaseObject.is_archived
    );

    user.existsInDataBase = true;
    return user;
  }

  toJSON(): Object {
    return {
      id: this.id,
      pseudo: this.pseudo,
      email: this.email,
      registrationDate: this.registrationDate,
      lastConnexionDate: this.lastConnexionDate,
      wsToken: this.wsToken,
      isAdmin: this.isAdmin,
      isArchived: this.isArchived
    };
  }
}
