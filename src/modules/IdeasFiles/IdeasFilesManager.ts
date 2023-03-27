import path from "path";
import {IdeaErrors, UserErrors} from "../../Global/BackendErrors";
import {UploadedFile} from "express-fileupload";
import IdeaFileEntity from "./IdeaFileEntity";
import moment from "moment";

export default class IdeasFilesManager {
  public static async saveNewFile(
    uniqueName: string,
    file: UploadedFile,
    ideaId: number,
    location?: string
  ) {
    if (!location) {
      location = path.join(
        __dirname,
        `../../../data/ideas-files/`
      )
    }
    return new Promise(async resolve => {
      try {
        file.mv(location+uniqueName);
        const ideaFile = new IdeaFileEntity(null, file.name, uniqueName, file.mimetype, file.size, moment(), ideaId);
        await ideaFile.save();
        resolve({
          success: true,
          data: {
            location: location+uniqueName,
            ideaFile
          }
        })
      } catch (err) {
        resolve({
          success: false,
          error: {
            code: IdeaErrors.IDEA_SAVE_FILE_ERROR,
            message: err.toString(),
            details: location+uniqueName
          }
        })
      }
    });
  }

  public static isValidMimeImagesType (file: UploadedFile) {
    const mimeAvailables = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'image/svg+xml',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpg'
    ];
    return !!(mimeAvailables.find(m => m === file.mimetype));
  }
}
