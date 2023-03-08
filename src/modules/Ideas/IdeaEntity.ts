import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import {Moment} from "moment/moment";
import {TypeAccessTokenType} from "../../utils/Types";
import Utils from "../../utils/Utils";
import {GeneralErrors} from "../../Global/BackendErrors";

export default class IdeaEntity extends MysqlAbstractEntity<boolean> {
  public id: number | null;
  public object: string;
  public content: string;
  public mailFeedback: boolean;
  public date: Moment;
  public userId: number;

  constructor(
    id: number,
    object: string,
    content: string,
    mailFeedback: boolean,
    date: Moment,
    userId: number
  ) {
    super();
    this.id = id;
    this.object = object;
    this.content = content;
    this.mailFeedback = mailFeedback;
    this.date = date;
    this.userId = userId;
  }

  async save () {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `ideas` (`object`, `content`, `mail_feedback`, `date`, `user_id`) VALUES (:object, :content, :mailFeedback, :date, :userId)",
            {
              object: this.object,
              content: this.content,
              mailFeedback: this.mailFeedback,
              date: this.date.format("YYYY-MM-DD HH:mm:ss"),
              userId: this.userId
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `ideas` SET `object`= :object, `content`= :content, `mail_feedback`= :mailFeedback, `date`= :date, `user_id`= :userId WHERE `id`= :id",
            {
              object: this.object,
              content: this.content,
              mailFeedback: this.mailFeedback,
              date: this.date.format("YYYY-MM-DD HH:mm:ss"),
              userId: this.userId,
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
            message: "The access_token has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          accessToken: this
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
