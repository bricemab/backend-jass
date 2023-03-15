import {DatabaseSettings, DatabaseUser} from "../../Global/DatabaseType";
import UserEntity from "./UserEntity";
import Utils from "../../utils/Utils";
import {GeneralErrors, IdeaErrors} from "../../Global/BackendErrors";
import {ApplicationResponse, ApplicationResponsePromise} from "../../utils/Types";
import path from "path";
import fs from "fs";
import config from "../../config/config";
import AccessTokenEntity from "../AccessTokens/AccessTokenEntity";

export default class UsersManager {
  static async findById(
    id: number
  ): ApplicationResponsePromise<{ user: UserEntity }> {
    const user = Utils.castMysqlRecordToObject<DatabaseUser>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM users WHERE id = :id",
        { id }
      )
    );

    if (user) {
      return {
        success: true,
        data: {
          user: await UserEntity.fromDatabaseObject(user)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This users can't be found in database",
        details: {
          id
        }
      }
    };
  }

  static async findByWsToken(
    token: string
  ): ApplicationResponsePromise<{ user: UserEntity }> {
    const user = Utils.castMysqlRecordToObject<DatabaseUser>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM users WHERE ws_token = :wsToken",
        { wsToken: token }
      )
    );

    if (user) {
      return {
        success: true,
        data: {
          user: await UserEntity.fromDatabaseObject(user)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This users can't be found in database",
        details: {
          token
        }
      }
    };
  }

  static async findByEmail(
    email: string
  ): ApplicationResponsePromise<{user: UserEntity}> {
    const user = Utils.castMysqlRecordToObject<DatabaseUser>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM users WHERE email = :email",
        { email }
      )
    );

    if (user) {
      return {
        success: true,
        data: {
          user: await UserEntity.fromDatabaseObject(user)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This user can't be found in database",
        details: {
          email
        }
      }
    };
  }

  static async prepareResetPasswordMail(
    user: UserEntity,
    tokenEntity: AccessTokenEntity
  ): ApplicationResponsePromise<{content: string}> {
    const location = path.join(
      __dirname,
      `../../../data/mails/${user.language}/users/reset-password`
    );

    return new Promise(resolve => {
      fs.readFile(location, "utf8", (err, data) => {
        if (err) {
          resolve({
            success: false,
            error: {
              code: IdeaErrors.IDEA_PREPARE_NEW_IDEA,
              details: err,
              message: location
            }
          })
        } else {
          const tokenUrl = config.wwwHost + "/reset-password/" + tokenEntity.token
          data = Utils.replaceAllString(data, "#wwwHost#", config.wwwHost)
          data = Utils.replaceAllString(data, "#username#", user.pseudo)
          data = Utils.replaceAllString(data, "#email#", user.email)
          data = Utils.replaceAllString(data, "#date#", tokenEntity.expirationDate.format("HH:mm DD.MM.YYYY"))
          data = Utils.replaceAllString(data, "#link#", tokenUrl)
          resolve({
            success: true,
            data: {
              content: data
            }
          })
        }
      })
    })
  }


  static async prepareVerifiedAccountMail(
    user: UserEntity,
    accessToken: AccessTokenEntity
  ): ApplicationResponsePromise<{content: string}> {
    const location = path.join(
      __dirname,
      `../../../data/mails/${user.language}/users/register-verification`
    );

    return new Promise(resolve => {
      fs.readFile(location, "utf8", (err, data) => {
        if (err) {
          resolve({
            success: false,
            error: {
              code: IdeaErrors.IDEA_PREPARE_NEW_IDEA,
              details: err,
              message: location
            }
          })
        } else {
          const tokenUrl = config.wwwHost + "/verified-account/" + accessToken.token
          data = Utils.replaceAllString(data, "#wwwHost#", config.wwwHost)
          data = Utils.replaceAllString(data, "#username#", user.pseudo)
          data = Utils.replaceAllString(data, "#date#", accessToken.expirationDate.format("HH:mm DD.MM.YYYY"))
          data = Utils.replaceAllString(data, "#link#", tokenUrl)
          resolve({
            success: true,
            data: {
              content: data
            }
          })
        }
      })
    })
  }

  static async findUserLogin(
    username: string
  ): ApplicationResponse<{user: UserEntity}> {
    const user = Utils.castMysqlRecordToObject<DatabaseUser>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM users WHERE email = :username OR pseudo = :username",
        { username }
      )
    );

    if (user) {
      return {
        success: true,
        data: {
          user: await UserEntity.fromDatabaseObject(user)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This user can't be found in database",
        details: {
          username
        }
      }
    };
  }

  static async findByPseudo(
    pseudo: string
  ): ApplicationResponsePromise<{user: UserEntity}> {
    const user = Utils.castMysqlRecordToObject<DatabaseUser>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM users WHERE pseudo = :pseudo",
        { pseudo }
      )
    );

    if (user) {
      return {
        success: true,
        data: {
          user: await UserEntity.fromDatabaseObject(user)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This user can't be found in database",
        details: {
          pseudo
        }
      }
    };
  }
}
