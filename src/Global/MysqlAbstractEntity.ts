import Utils from "../utils/Utils";
import { GeneralErrors } from "./BackendErrors";
import AbstractEntity from "./AbstractEntity";

export default abstract class MysqlAbstractEntity<
  ObjectResult
> extends AbstractEntity {
  protected existsInDataBase: boolean;

  protected constructor() {
    super();
    this.existsInDataBase = false;
  }

  static fromDatabaseObjectSync<ObjectResult>(
    databaseObject: ObjectResult,
    isGlobal?: boolean
  ): any {
    Utils.manageError({
      code: GeneralErrors.METHOD_NOT_IMPLEMENTED,
      message: "This method should be overwritten on child class"
    });
  }

  static fromDatabaseObject<ObjectResult>(databaseObject: any): any {
    Utils.manageError({
      code: GeneralErrors.METHOD_NOT_IMPLEMENTED,
      message: "This method should be overwritten on child class"
    });
  }
}
