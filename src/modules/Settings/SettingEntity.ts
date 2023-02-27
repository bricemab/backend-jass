import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import {DatabaseSettings} from "../../Global/DatabaseType";

export default class SettingEntity extends MysqlAbstractEntity<boolean> {
  public key: string;
  public value: string;

  constructor(
    key: string,
    value: string
  ) {
    super();
    this.key = key;
    this.value = value;
  }

  static fromDatabaseObject(databaseObject: DatabaseSettings) {
    const setting = new SettingEntity(
      databaseObject.key,
      databaseObject.value
    );

    setting.existsInDataBase = true;
    return setting;
  }

  toJSON(): Object {
    return {
      key: this.key,
      value: this.value
    };
  }
}
