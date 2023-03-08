import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import Utils from "../../utils/Utils";
import {GeneralErrors} from "../../Global/BackendErrors";
import {Moment} from "moment";

export default class IdeaFileEntity extends MysqlAbstractEntity<boolean> {
  public id: number | null;
  public name: string;
  public uniqueName: string;
  public mimeType: string;
  public size: number;
  public date: Moment;
  public ideaId: number;

  constructor(
    id: number,
    name: string,
    uniqueName: string,
    mimeType: string,
    size: number,
    date: Moment,
    ideaId: number
  ) {
    super();
    this.id = id;
    this.name = name;
    this.uniqueName = uniqueName;
    this.mimeType = mimeType;
    this.size = size;
    this.date = date;
    this.ideaId = ideaId;
  }

  async save () {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `ideas_files` (`name`, `unique_name`, `mime_type`, `size`, `date`, `idea_id`) VALUES (:name, :uniqueName, :mimeType, :size, :date, :ideaId)",
            {
              name: this.name,
              uniqueName: this.uniqueName,
              mimeType: this.mimeType,
              size: this.size,
              date: this.date.format("YYYY-MM-DD HH:mm:ss"),
              ideaId: this.ideaId
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `ideas_files` SET `name`= :name, `unique_name`= :uniqueName, `mime_type`= :mimeType, `size`= :size, `date`= :date, `idea_id`= :ideaId WHERE `id`= :id",
            {
              name: this.name,
              uniqueName: this.uniqueName,
              mimeType: this.mimeType,
              size: this.size,
              date: this.date.format("YYYY-MM-DD HH:mm:ss"),
              ideaId: this.ideaId,
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
            message: "The ideas_files has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          ideaFile: this
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
}
