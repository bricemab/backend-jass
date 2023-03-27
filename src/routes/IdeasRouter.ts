import {Response, Router} from "express";
import AclManager from "../permissions/AclManager";
import {Permissions} from "../permissions/permissions";
import RequestManager from "../Global/RequestManager";
import {ApplicationRequest} from "../utils/Types";
import {AuthenticationErrors, GeneralErrors} from "../Global/BackendErrors";
import GlobalStore from "../utils/GlobalStore";
import Mailer from "../services/Mailer/Mailer";
import IdeasManager from "../modules/Ideas/IdeasManager";
import Utils from "../utils/Utils";
import path from "path";
import {uniqueId} from "lodash";
import IdeasFilesManager from "../modules/IdeasFiles/IdeasFilesManager";
import IdeaEntity from "../modules/Ideas/IdeaEntity";
import moment from "moment";

const IdeasRouter = Router();

IdeasRouter.post(
  "/new",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedIn),
  RequestManager.asyncResolver(
  async (
    request: ApplicationRequest<{
      object: string;
      content: string;
      feedback: string;
    }>,
    response: Response
  ) => {
    if (!request.hasValidToken && !request.tokenDecryptedData && !request.tokenDecryptedData.currentUser) {
      return RequestManager.sendResponse(response, {
        success: false,
        error: {
          code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
          message: "You have to be logged on"
        }
      })
    }
    const { currentUser } = request.tokenDecryptedData;
    if (
      !request.body &&
      !request.body.object &&
      request.body.object.trim() === "" &&
      !request.body.feedback &&
      !request.body.content &&
      request.body.content.trim() === ""
    ) {
      return RequestManager.sendResponse(response, {
        success: false,
        error: {
          code: GeneralErrors.VALIDATION_ERROR,
          message: "Data are not correctly provided"
        }
      })
    }
    const {content, feedback, object} = request.body;
    const idea = new IdeaEntity(null, object, content, feedback === "1", moment(), currentUser.id);
    await idea.save();
    await IdeasManager.newIdeaSendMail(currentUser, idea);
    if (request.files) {
      if (request.files["files"].length === undefined) {
        const file = request.files["files"];
        if (IdeasFilesManager.isValidMimeImagesType(file)) {
          const uniqueName = Utils.uniqueId(20);
          await IdeasFilesManager.saveNewFile(uniqueName, file, idea.id);
        }
      } else {
        for (const file of request.files["files"]) {
          if (IdeasFilesManager.isValidMimeImagesType(file)) {
            const uniqueName = Utils.uniqueId(20);
            await IdeasFilesManager.saveNewFile(uniqueName, file, idea.id);
          }
        }
      }
    }

    return RequestManager.sendResponse(response, {
      success: true,
      data: {}
    })
  })
);

export default IdeasRouter;
