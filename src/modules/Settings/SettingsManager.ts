import {ApplicationResponsePromise, DatabaseSettings} from "../../utils/Types";
import Utils from "../../utils/Utils";
import SettingEntity from "./SettingEntity";
import {GeneralErrors} from "../../Global/BackendErrors";

export default class SettingsManager {
  public static async findByValue(
    value: string
  ): ApplicationResponsePromise<{ setting: SettingEntity }> {
    const setting = Utils.castMysqlRecordToObject<DatabaseSettings>(
      await Utils.getMysqlPool().execute(
        "SELECT * FROM settings WHERE value = :value",
        { value }
      )
    );

    if (setting) {
      return {
        success: true,
        data: {
          setting: await SettingEntity.fromDatabaseObject(setting)
        }
      }
    }
    return {
      success: false,
      error: {
        code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
        message: "This setting can't be found in database",
        details: {
          value
        }
      }
    };
  }
}
