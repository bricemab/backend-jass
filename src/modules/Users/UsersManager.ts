import {DatabaseSettings, DatabaseUser} from "../../Global/DatabaseType";
import UserEntity from "./UserEntity";
import Utils from "../../utils/Utils";
import {GeneralErrors} from "../../Global/BackendErrors";
import {ApplicationResponse, ApplicationResponsePromise} from "../../utils/Types";

export default class UsersManager {
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
        message: "This setting can't be found in database",
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

  static async findUserLogin(
    username: string
  ): ApplicationResponsePromise<{user: UserEntity}> {
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
