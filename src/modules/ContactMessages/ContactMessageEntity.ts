import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import {Moment} from "moment";
import Utils from "../../utils/Utils";
import {GeneralErrors} from "../../Global/BackendErrors";
import {DatabaseConcatMessage, DatabaseUser} from "../../Global/DatabaseType";
import moment from "moment/moment";

export default class ContactMessageEntity extends MysqlAbstractEntity<boolean> {
  public id: number | null;
  public subject: string;
  public content: string;
  public date: Moment;
  public email: string;

  constructor(id: number | null, subject: string, content: string, date: Moment, email: string) {
    super();
    this.id = id;
    this.subject = subject;
    this.content = content;
    this.date = date;
    this.email = email;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `contact_messages` (`subject`, `content`, `date`, `email`) VALUES (:subject, :content, :date, :email)",
            {
              subject: this.subject,
              email: this.email,
              content: this.content,
              date: this.date.format("YYYY-MM-DD HH:mm:ss")
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `contact_messages` SET `subject`= :subject, `email`= :email, `content`= :content, `date`= :date WHERE `id`= :id",
            {
              subject: this.subject,
              email: this.email,
              content: this.content,
              date: this.date.format("YYYY-MM-DD HH:mm:ss"),
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
            message: "The contact_messages has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          contactMessage: this
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

  static fromDatabaseObject(databaseObject: DatabaseConcatMessage): ContactMessageEntity {
    const user = new ContactMessageEntity(
      databaseObject.id,
      databaseObject.subject,
      databaseObject.content,
      moment(databaseObject.date),
      databaseObject.email
    );

    user.existsInDataBase = true;
    return user;
  }

  toJSON(): Object {
    return {
      id: this.id,
      subject: this.subject,
      content: this.content,
      date: this.date,
      email: this.email
    };
  }
}
