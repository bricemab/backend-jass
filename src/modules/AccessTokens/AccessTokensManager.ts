import {ApplicationResponsePromise, TypeAccessTokenType} from "../../utils/Types";
import Utils from "../../utils/Utils";
import AccessTokenEntity from "./AccessTokenEntity";
import {GeneralErrors} from "../../Global/BackendErrors";
import {DatabaseAccessToken} from "../../Global/DatabaseType";

export default class AccessTokensManager {
  public static async findByToken(
    token: string,
    type: TypeAccessTokenType
    // @ts-ignore
  ): ApplicationResponsePromise<{ accessToken: AccessTokenEntity }> {
    const accessToken = Utils.castMysqlRecordToObject<DatabaseAccessToken>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM access_tokens WHERE token = :token AND `type` = :type",
        { token, type }
      )
    );

    if (accessToken) {
      return {
        success: true,
        data: {
          accessToken: await AccessTokenEntity.fromDatabaseObject(accessToken)
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
}
